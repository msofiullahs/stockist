<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StockReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function collection()
    {
        return Product::with(['category', 'warehouses'])->get();
    }

    public function headings(): array
    {
        return ['Product Name', 'SKU', 'Category', 'Unit', 'Current Stock', 'Min Stock', 'Cost Price', 'Stock Value', 'Status'];
    }

    public function map($product): array
    {
        return [
            $product->name,
            $product->sku,
            $product->category?->name ?? '-',
            $product->unit,
            $product->current_stock,
            $product->minimum_stock,
            number_format($product->cost_price, 2),
            number_format($product->current_stock * $product->cost_price, 2),
            $product->isLowStock() ? 'LOW STOCK' : 'OK',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
