<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private function getDirectorySize(string $path): int
    {
        $size = 0;
        if (!is_dir($path)) return $size;

        foreach (File::allFiles($path) as $file) {
            $size += $file->getSize();
        }

        return $size;
    }

    private function getDatabaseSize(): int
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            $path = DB::connection()->getDatabaseName();
            return file_exists($path) ? filesize($path) : 0;
        }

        // MySQL / MariaDB
        $dbName = DB::connection()->getDatabaseName();
        $result = DB::select("SELECT SUM(data_length + index_length) as size FROM information_schema.tables WHERE table_schema = ?", [$dbName]);

        return (int) ($result[0]->size ?? 0);
    }

    private function getStorageUsage(): array
    {
        $appSize = $this->getDirectorySize(storage_path('app'));
        $dbSize = $this->getDatabaseSize();
        $totalUsed = $appSize + $dbSize;

        // STORAGE_CAPACITY from .env in MB
        $capacityMb = (int) env('STORAGE_CAPACITY', 5000);
        $capacityBytes = $capacityMb * 1024 * 1024;

        $percentage = $capacityBytes > 0 ? round(($totalUsed / $capacityBytes) * 100, 1) : 0;

        return [
            'app_size' => $appSize,
            'db_size' => $dbSize,
            'total_used' => $totalUsed,
            'capacity' => $capacityBytes,
            'capacity_mb' => $capacityMb,
            'percentage' => min($percentage, 100),
        ];
    }

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

        // Storage usage
        $storageUsage = $this->getStorageUsage();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'lowStockProducts' => $lowStockProducts,
            'monthlyMovements' => $monthlyMovements,
            'topProducts' => $topProducts,
            'recentMovements' => $recentMovements,
            'storageUsage' => $storageUsage,
        ]);
    }
}
