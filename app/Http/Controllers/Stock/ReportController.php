<?php

namespace App\Http\Controllers\Stock;

use App\Exports\MovementReportExport;
use App\Exports\StockReportExport;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function stockReport(Request $request)
    {
        $query = Product::with(['category', 'supplier', 'warehouses']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $products = $query->orderBy('name')->get()->map(fn ($product) => [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'category' => $product->category?->name ?? '-',
            'supplier' => $product->supplier?->name ?? '-',
            'unit' => $product->unit,
            'current_stock' => $product->current_stock,
            'minimum_stock' => $product->minimum_stock,
            'cost_price' => $product->cost_price,
            'selling_price' => $product->selling_price,
            'stock_value' => number_format($product->current_stock * $product->cost_price, 2),
            'is_low_stock' => $product->isLowStock(),
        ]);

        return Inertia::render('Stock/Reports/StockReport', [
            'products' => $products,
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['search', 'category_id']),
            'summary' => [
                'totalProducts' => $products->count(),
                'totalValue' => round($products->sum(fn ($p) => (float) str_replace(',', '', $p['stock_value'])), 2),
                'lowStockCount' => $products->where('is_low_stock', true)->count(),
            ],
        ]);
    }

    public function movementReport(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->subMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', now()->format('Y-m-d'));

        $query = StockMovement::with(['product', 'warehouse', 'user'])
            ->whereBetween('date', [$dateFrom, $dateTo]);

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

        $movements = $query->orderByDesc('date')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($movement) => [
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
            ]);

        $summaryQuery = StockMovement::whereBetween('date', [$dateFrom, $dateTo]);
        $totalIn = (clone $summaryQuery)->where('type', 'in')->sum('quantity');
        $totalOut = (clone $summaryQuery)->where('type', 'out')->sum('quantity');
        $totalAdjustments = (clone $summaryQuery)->where('type', 'adjustment')->sum('quantity');

        return Inertia::render('Stock/Reports/MovementReport', [
            'movements' => $movements,
            'warehouses' => Warehouse::select('id', 'name')->where('is_active', true)->orderBy('name')->get(),
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'type' => $request->input('type', ''),
                'warehouse_id' => $request->input('warehouse_id', ''),
            ],
            'summary' => [
                'totalIn' => (int) $totalIn,
                'totalOut' => (int) $totalOut,
                'totalAdjustments' => (int) $totalAdjustments,
            ],
        ]);
    }

    public function exportStockPdf()
    {
        $products = Product::with(['category', 'warehouses'])
            ->orderBy('name')
            ->get()
            ->map(fn ($product) => [
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category?->name ?? '-',
                'unit' => $product->unit,
                'current_stock' => $product->current_stock,
                'cost_price' => number_format($product->cost_price, 2),
                'stock_value' => number_format($product->current_stock * $product->cost_price, 2),
            ]);

        $pdf = Pdf::loadView('exports.stock-report', [
            'products' => $products,
            'date' => now()->format('Y-m-d H:i'),
        ]);

        return $pdf->download('stock-report-' . now()->format('Y-m-d') . '.pdf');
    }

    public function exportStockExcel()
    {
        return Excel::download(new StockReportExport, 'stock-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    public function exportMovementPdf(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->subMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', now()->format('Y-m-d'));

        $movements = StockMovement::with(['product', 'warehouse', 'user'])
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->orderByDesc('date')
            ->get();

        $pdf = Pdf::loadView('exports.movement-report', [
            'movements' => $movements,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'date' => now()->format('Y-m-d H:i'),
        ]);

        return $pdf->download('movement-report-' . now()->format('Y-m-d') . '.pdf');
    }

    public function exportMovementExcel(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->subMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', now()->format('Y-m-d'));

        return Excel::download(
            new MovementReportExport($dateFrom, $dateTo),
            'movement-report-' . now()->format('Y-m-d') . '.xlsx'
        );
    }
}
