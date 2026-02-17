<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Count low stock products
        $lowStockCount = Product::with('warehouses')
            ->where('is_active', true)
            ->get()
            ->filter(fn ($product) => $product->isLowStock())
            ->count();

        $stats = [
            'totalProducts' => Product::count(),
            'totalCategories' => Category::count(),
            'totalSuppliers' => Supplier::count(),
            'totalWarehouses' => Warehouse::count(),
            'pendingOrders' => PurchaseOrder::where('status', 'pending')->count(),
            'lowStockCount' => $lowStockCount,
        ];

        // Low stock products
        $lowStockProducts = Product::with(['category', 'warehouses'])
            ->where('is_active', true)
            ->get()
            ->filter(fn ($product) => $product->isLowStock())
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category?->name,
                'current_stock' => $product->current_stock,
                'minimum_stock' => $product->minimum_stock,
                'unit' => $product->unit,
            ])
            ->values()
            ->take(10);

        // Stock chart data - last 12 months
        $dateFormat = DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', date)"
            : "DATE_FORMAT(date, '%Y-%m')";

        $stockChartData = StockMovement::select(
                DB::raw("{$dateFormat} as month"),
                DB::raw("SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END) as stock_in"),
                DB::raw("SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END) as stock_out")
            )
            ->where('date', '>=', now()->subMonths(12)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Top products by movement count
        $topProducts = Product::withCount('stockMovements')
            ->orderByDesc('stock_movements_count')
            ->take(5)
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'movements_count' => $product->stock_movements_count,
            ]);

        // Recent movements
        $recentMovements = StockMovement::with(['product', 'warehouse', 'user'])
            ->orderByDesc('date')
            ->orderByDesc('created_at')
            ->take(10)
            ->get()
            ->map(fn ($movement) => [
                'id' => $movement->id,
                'product' => $movement->product?->name ?? '-',
                'sku' => $movement->product?->sku ?? '-',
                'warehouse' => $movement->warehouse?->name ?? '-',
                'type' => $movement->type,
                'quantity' => $movement->quantity,
                'date' => $movement->date instanceof \Carbon\Carbon
                    ? $movement->date->format('M d, Y')
                    : $movement->date,
                'user' => $movement->user?->name ?? '-',
            ]);

        // Transform chart data to match frontend
        $monthlyMovements = $stockChartData->map(fn ($item) => [
            'month' => $item->month,
            'in' => (int) $item->stock_in,
            'out' => (int) $item->stock_out,
        ]);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'lowStockProducts' => $lowStockProducts,
            'monthlyMovements' => $monthlyMovements,
            'topProducts' => $topProducts,
            'recentMovements' => $recentMovements,
        ]);
    }
}
