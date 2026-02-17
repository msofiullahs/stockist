<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use App\Notifications\LowStockNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'user'])
            ->withCount('items');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $orders = $query->orderByDesc('order_date')->paginate(15)->withQueryString();

        return Inertia::render('Stock/PurchaseOrders/Index', [
            'orders' => $orders->through(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'supplier' => $order->supplier ? ['id' => $order->supplier->id, 'name' => $order->supplier->name] : null,
                    'user' => $order->user ? ['id' => $order->user->id, 'name' => $order->user->name] : null,
                    'status' => $order->status,
                    'total_amount' => $order->total_amount,
                    'items_count' => $order->items_count,
                    'order_date' => $order->order_date instanceof \Carbon\Carbon
                        ? $order->order_date->format('M d, Y')
                        : $order->order_date,
                ];
            }),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Stock/PurchaseOrders/Form', [
            'suppliers' => Supplier::select('id', 'name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'products' => Product::select('id', 'name', 'sku', 'cost_price', 'unit')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'orderNumber' => PurchaseOrder::generateOrderNumber(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_number' => ['required', 'string', 'max:50', 'unique:purchase_orders,order_number'],
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'order_date' => ['required', 'date'],
            'expected_date' => ['nullable', 'date', 'after_or_equal:order_date'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $totalAmount = collect($validated['items'])->sum(function ($item) {
                return $item['quantity'] * $item['unit_price'];
            });

            $order = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'user_id' => $request->user()->id,
                'order_number' => $validated['order_number'],
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                    'received_quantity' => 0,
                ]);
            }
        });

        return redirect()->route('purchase-orders.index')
            ->with('success', 'flash_po_created');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'user', 'items.product']);

        return Inertia::render('Stock/PurchaseOrders/Show', [
            'order' => $purchaseOrder,
            'warehouses' => Warehouse::select('id', 'name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function receive(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:purchase_order_items,id'],
            'items.*.received_quantity' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($validated, $purchaseOrder, $request) {
            foreach ($validated['items'] as $itemData) {
                $item = $purchaseOrder->items()->find($itemData['id']);
                if (!$item || $itemData['received_quantity'] <= 0) {
                    continue;
                }

                $item->update([
                    'received_quantity' => $item->received_quantity + $itemData['received_quantity'],
                ]);

                // Create stock movement
                StockMovement::create([
                    'product_id' => $item->product_id,
                    'warehouse_id' => $validated['warehouse_id'],
                    'user_id' => $request->user()->id,
                    'type' => 'in',
                    'quantity' => $itemData['received_quantity'],
                    'reference_type' => PurchaseOrder::class,
                    'reference_id' => $purchaseOrder->id,
                    'notes' => "Received from PO #{$purchaseOrder->order_number}",
                    'date' => now(),
                ]);

                // Update warehouse stock
                $warehouseStock = DB::table('warehouse_stocks')
                    ->where('product_id', $item->product_id)
                    ->where('warehouse_id', $validated['warehouse_id'])
                    ->first();

                if ($warehouseStock) {
                    DB::table('warehouse_stocks')
                        ->where('product_id', $item->product_id)
                        ->where('warehouse_id', $validated['warehouse_id'])
                        ->update([
                            'quantity' => $warehouseStock->quantity + $itemData['received_quantity'],
                            'updated_at' => now(),
                        ]);
                } else {
                    DB::table('warehouse_stocks')->insert([
                        'product_id' => $item->product_id,
                        'warehouse_id' => $validated['warehouse_id'],
                        'quantity' => $itemData['received_quantity'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Check low stock
                $product = Product::with('warehouses')->find($item->product_id);
                if ($product && $product->isLowStock()) {
                    $usersToNotify = User::role(['admin', 'manager'])->get();
                    foreach ($usersToNotify as $user) {
                        $user->notify(new LowStockNotification($product));
                    }
                }
            }

            // Check if all items are fully received
            $purchaseOrder->refresh();
            $allReceived = $purchaseOrder->items->every(function ($item) {
                return $item->received_quantity >= $item->quantity;
            });

            if ($allReceived) {
                $purchaseOrder->update([
                    'status' => 'received',
                    'received_date' => now(),
                ]);
            } else {
                $purchaseOrder->update(['status' => 'partial']);
            }
        });

        return redirect()->route('purchase-orders.show', $purchaseOrder)
            ->with('success', 'flash_po_received');
    }

    public function updateStatus(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,shipped,partial,received,cancelled'],
        ]);

        $purchaseOrder->update($validated);

        return redirect()->route('purchase-orders.show', $purchaseOrder)
            ->with('success', 'flash_po_status_updated');
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        if (in_array($purchaseOrder->status, ['received', 'partial'])) {
            return back()->with('error', 'flash_po_cannot_delete');
        }

        $purchaseOrder->items()->delete();
        $purchaseOrder->delete();

        return redirect()->route('purchase-orders.index')
            ->with('success', 'flash_po_deleted');
    }
}
