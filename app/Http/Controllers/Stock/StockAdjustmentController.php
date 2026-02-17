<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use App\Notifications\LowStockNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockAdjustmentController extends Controller
{
    public function index(Request $request)
    {
        $query = StockAdjustment::with(['product', 'warehouse', 'user']);

        if ($search = $request->input('search')) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($type = $request->input('adjustment_type')) {
            $query->where('adjustment_type', $type);
        }

        if ($warehouseId = $request->input('warehouse_id')) {
            $query->where('warehouse_id', $warehouseId);
        }

        $adjustments = $query->orderByDesc('date')
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Stock/Adjustments/Index', [
            'adjustments' => $adjustments->through(function ($adj) {
                return [
                    'id' => $adj->id,
                    'product' => $adj->product?->name ?? '-',
                    'sku' => $adj->product?->sku ?? '-',
                    'warehouse' => $adj->warehouse?->name ?? '-',
                    'adjustment_type' => $adj->adjustment_type,
                    'quantity_before' => $adj->quantity_before,
                    'quantity_after' => $adj->quantity_after,
                    'difference' => $adj->quantity_after - $adj->quantity_before,
                    'reason' => $adj->reason,
                    'user' => $adj->user?->name ?? '-',
                    'date' => $adj->date instanceof \Carbon\Carbon
                        ? $adj->date->format('M d, Y')
                        : $adj->date,
                ];
            }),
            'warehouses' => Warehouse::select('id', 'name')->where('is_active', true)->orderBy('name')->get(),
            'filters' => $request->only(['search', 'adjustment_type', 'warehouse_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Stock/Adjustments/Form', [
            'products' => Product::select('id', 'name', 'sku', 'unit')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'warehouses' => Warehouse::select('id', 'name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'adjustment_type' => ['required', 'in:increase,decrease,damage,expired,correction'],
            'quantity_after' => ['required', 'integer', 'min:0'],
            'reason' => ['nullable', 'string'],
            'date' => ['required', 'date'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Get current warehouse stock
            $warehouseStock = DB::table('warehouse_stocks')
                ->where('product_id', $validated['product_id'])
                ->where('warehouse_id', $validated['warehouse_id'])
                ->first();

            $quantityBefore = $warehouseStock ? $warehouseStock->quantity : 0;

            // Create the adjustment record
            StockAdjustment::create([
                'product_id' => $validated['product_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'user_id' => $request->user()->id,
                'adjustment_type' => $validated['adjustment_type'],
                'quantity_before' => $quantityBefore,
                'quantity_after' => $validated['quantity_after'],
                'reason' => $validated['reason'] ?? null,
                'date' => $validated['date'],
            ]);

            // Update warehouse stock
            if ($warehouseStock) {
                DB::table('warehouse_stocks')
                    ->where('product_id', $validated['product_id'])
                    ->where('warehouse_id', $validated['warehouse_id'])
                    ->update([
                        'quantity' => $validated['quantity_after'],
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('warehouse_stocks')->insert([
                    'product_id' => $validated['product_id'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'quantity' => $validated['quantity_after'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Create a stock movement for tracking
            $difference = $validated['quantity_after'] - $quantityBefore;
            if ($difference !== 0) {
                StockMovement::create([
                    'product_id' => $validated['product_id'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'user_id' => $request->user()->id,
                    'type' => $difference > 0 ? 'in' : 'out',
                    'quantity' => abs($difference),
                    'reference_type' => StockAdjustment::class,
                    'reference_id' => null,
                    'notes' => "Stock adjustment ({$validated['adjustment_type']}): " . ($validated['reason'] ?? 'No reason provided'),
                    'date' => $validated['date'],
                ]);
            }

            // Check low stock and notify
            $product = Product::with('warehouses')->find($validated['product_id']);
            if ($product && $product->isLowStock()) {
                $usersToNotify = User::role(['admin', 'manager'])->get();
                foreach ($usersToNotify as $user) {
                    $user->notify(new LowStockNotification($product));
                }
            }
        });

        return redirect()->route('stock-adjustments.index')
            ->with('success', 'flash_adjustment_created');
    }
}
