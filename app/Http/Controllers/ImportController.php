<?php

namespace App\Http\Controllers;

use App\Imports\CategoryImport;
use App\Imports\ProductImport;
use App\Imports\PurchaseOrderImport;
use App\Imports\StockMovementImport;
use App\Imports\SupplierImport;
use App\Imports\WarehouseImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportController extends Controller
{
    private array $templates = [
        'categories' => [
            'headers' => ['name', 'description', 'parent'],
            'sample' => [
                ['Electronics', 'Electronic devices and accessories', ''],
                ['Smartphones', 'Mobile phones and tablets', 'Electronics'],
            ],
        ],
        'suppliers' => [
            'headers' => ['name', 'email', 'phone', 'address', 'city', 'country', 'contact_person', 'is_active'],
            'sample' => [
                ['Acme Corp', 'contact@acme.com', '+1234567890', '123 Main St', 'New York', 'USA', 'John Doe', 'yes'],
            ],
        ],
        'warehouses' => [
            'headers' => ['name', 'location', 'address', 'is_active'],
            'sample' => [
                ['Main Warehouse', 'Downtown', '456 Storage Ave', 'yes'],
            ],
        ],
        'products' => [
            'headers' => ['name', 'sku', 'description', 'category', 'supplier', 'unit', 'cost_price', 'selling_price', 'minimum_stock', 'is_active'],
            'sample' => [
                ['Widget A', 'WDG-001', 'Standard widget', 'Electronics', 'Acme Corp', 'Pieces', '10.00', '15.00', '50', 'yes'],
            ],
        ],
        'stock-movements' => [
            'headers' => ['product_sku', 'warehouse', 'type', 'quantity', 'date', 'notes'],
            'sample' => [
                ['WDG-001', 'Main Warehouse', 'in', '100', '2026-01-15', 'Initial stock'],
            ],
        ],
        'purchase-orders' => [
            'headers' => ['order_number', 'supplier', 'product_sku', 'quantity', 'unit_price', 'order_date', 'expected_date', 'status', 'notes'],
            'sample' => [
                ['PO-20260215-0001', 'Acme Corp', 'WDG-001', '50', '10.00', '2026-02-15', '2026-03-01', 'draft', 'Urgent order'],
                ['PO-20260215-0001', 'Acme Corp', 'WDG-002', '30', '12.00', '2026-02-15', '2026-03-01', 'draft', ''],
            ],
        ],
    ];

    public function import(Request $request, string $type)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:5120'],
        ]);

        $importClass = $this->getImportClass($type);
        if (!$importClass) {
            return back()->with('error', 'flash_import_invalid_type');
        }

        try {
            $import = new $importClass();
            Excel::import($import, $request->file('file'));

            $message = "flash_import_success:{$import->imported}:{$import->skipped}";

            if (!empty($import->errors)) {
                $errorDetails = implode('; ', array_slice($import->errors, 0, 5));
                return back()->with('success', $message)->with('import_errors', $errorDetails);
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'flash_import_failed');
        }
    }

    public function template(string $type): StreamedResponse
    {
        $template = $this->templates[$type] ?? null;
        if (!$template) {
            abort(404);
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Import Template');

        // Write headers
        foreach ($template['headers'] as $colIndex => $header) {
            $cell = $sheet->getCellByColumnAndRow($colIndex + 1, 1);
            $cell->setValue($header);
            $cell->getStyle()->getFont()->setBold(true)->setSize(11);
            $sheet->getColumnDimensionByColumn($colIndex + 1)->setAutoSize(true);
        }

        // Write sample data
        foreach ($template['sample'] as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {
                $sheet->setCellValueByColumnAndRow($colIndex + 1, $rowIndex + 2, $value);
            }
        }

        // Style header row
        $headerRange = 'A1:' . $sheet->getCellByColumnAndRow(count($template['headers']), 1)->getCoordinate();
        $sheet->getStyle($headerRange)->applyFromArray([
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFE8F0FE'],
            ],
            'borders' => [
                'bottom' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                ],
            ],
        ]);

        $filename = "import-template-{$type}.xlsx";

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function getImportClass(string $type): ?string
    {
        return match ($type) {
            'categories' => CategoryImport::class,
            'suppliers' => SupplierImport::class,
            'warehouses' => WarehouseImport::class,
            'products' => ProductImport::class,
            'stock-movements' => StockMovementImport::class,
            'purchase-orders' => PurchaseOrderImport::class,
            default => null,
        };
    }
}
