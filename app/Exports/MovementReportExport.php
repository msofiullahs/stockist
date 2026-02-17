<?php

namespace App\Exports;

use App\Models\StockMovement;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MovementReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function __construct(protected string $dateFrom, protected string $dateTo) {}

    public function collection()
    {
        return StockMovement::with(['product', 'warehouse', 'user'])
            ->whereBetween('date', [$this->dateFrom, $this->dateTo])
            ->orderBy('date', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return ['Date', 'Product', 'SKU', 'Warehouse', 'Type', 'Quantity', 'Notes', 'User'];
    }

    public function map($movement): array
    {
        return [
            $movement->date->format('Y-m-d'),
            $movement->product?->name ?? '-',
            $movement->product?->sku ?? '-',
            $movement->warehouse?->name ?? '-',
            strtoupper($movement->type),
            $movement->quantity,
            $movement->notes ?? '-',
            $movement->user?->name ?? '-',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
