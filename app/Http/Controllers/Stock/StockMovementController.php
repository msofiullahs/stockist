<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use App\Notifications\LowStockNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $query = StockMovement::with(['product', 'warehouse', 'user']);

        if ($search = $request->input('search')) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($warehouseId = $request->input('warehouse_id')) {
            $query->where('warehouse_id', $warehouseId);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->where('date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->where('date', '<=', $dateTo);
        }

        $movements = $query->orderByDesc('date')
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Stock/Movements/Index', [
            'movements' => $movements->through(function ($movement) {
                return [
                    'id' => $movement->id,
                    'product' => $movement->product?->name ?? '-',
                    'sku' => $movement->product?->sku ?? '-',
                    'warehouse' => $movement->warehouse?->name ?? '-',
                    'type' => $movement->type,
                    'quantity' => $movement->quantity,
                    'notes' => $movement->notes,
                    'user' => $movement->user?->name ?? '-',
                    'date' => $movement->date instanceof \Carbon\Carbon
                        ? $movement->date->format('M d, Y')
                        : $movement->date,
                    'created_at' => $movement->created_at->format('M d, Y H:i'),
                ];
            }),
            'warehouses' => Warehouse::select('id', 'name')->where('is_active', true)->orderBy('name')->get(),
            'filters' => $request->only(['search', 'type', 'warehouse_id', 'date_from', 'date_to']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Stock/Movements/Form', [
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
            'type' => ['required', 'in:in,out'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
            'date' => ['required', 'date'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Create the movement
            $movement = StockMovement::create([
                ...$validated,
                'user_id' => $request->user()->id,
            ]);

            // Update warehouse_stocks table
            $warehouseStock = DB::table('warehouse_stocks')
                ->where('product_id', $validated['product_id'])
                ->where('warehouse_id', $validated['warehouse_id'])
                ->first();

            if ($warehouseStock) {
                $newQuantity = $validated['type'] === 'in'
                    ? $warehouseStock->quantity + $validated['quantity']
                    : max(0, $warehouseStock->quantity - $validated['quantity']);

                DB::table('warehouse_stocks')
                    ->where('product_id', $validated['product_id'])
                    ->where('warehouse_id', $validated['warehouse_id'])
                    ->update([
                        'quantity' => $newQuantity,
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('warehouse_stocks')->insert([
                    'product_id' => $validated['product_id'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'quantity' => $validated['type'] === 'in' ? $validated['quantity'] : 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Check low stock and notify admins/managers
            $product = Product::with('warehouses')->find($validated['product_id']);
            if ($product && $product->isLowStock()) {
                $usersToNotify = User::role(['admin', 'manager'])->get();
                foreach ($usersToNotify as $user) {
                    $user->notify(new LowStockNotification($product));
                }
            }
        });

        return redirect()->route('stock-movements.index')
            ->with('success', 'flash_movement_created');
    }
}
