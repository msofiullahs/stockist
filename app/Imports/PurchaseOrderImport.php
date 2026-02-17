<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class PurchaseOrderImport implements ToCollection, WithHeadingRow
{
    public int $imported = 0;
    public int $skipped = 0;
    public array $errors = [];

    public function collection(Collection $rows)
    {
        $grouped = [];

        foreach ($rows as $index => $row) {
            $orderNumber = trim($row['order_number'] ?? '');
            if (empty($orderNumber)) continue;
            $grouped[$orderNumber][] = ['row' => $row, 'index' => $index];
        }

        foreach ($grouped as $orderNumber => $items) {
            $rowNumber = $items[0]['index'] + 2;

            try {
                if (PurchaseOrder::where('order_number', $orderNumber)->exists()) {
                    $this->skipped += count($items);
                    continue;
                }

                $firstRow = $items[0]['row'];
                $supplierName = trim($firstRow['supplier'] ?? '');

                if (empty($supplierName)) {
                    $this->skipped += count($items);
                    $this->errors[] = "Row {$rowNumber}: Supplier name is required.";
                    continue;
                }

                $supplier = Supplier::where('name', $supplierName)->first();

                if (!$supplier) {
                    $this->skipped += count($items);
                    $this->errors[] = "Row {$rowNumber}: Supplier '{$supplierName}' not found.";
                    continue;
                }

                DB::transaction(function () use ($orderNumber, $firstRow, $supplier, $items, &$rowNumber) {
                    $po = PurchaseOrder::create([
                        'order_number' => $orderNumber,
                        'supplier_id' => $supplier->id,
                        'user_id' => Auth::id(),
                        'status' => strtolower(trim($firstRow['status'] ?? 'draft')) ?: 'draft',
                        'total_amount' => 0,
                        'order_date' => trim($firstRow['order_date'] ?? now()->toDateString()),
                        'expected_date' => trim($firstRow['expected_date'] ?? '') ?: null,
                        'notes' => trim($firstRow['notes'] ?? '') ?: null,
                    ]);

                    $totalAmount = 0;

                    foreach ($items as $item) {
                        $row = $item['row'];
                        $productSku = trim($row['product_sku'] ?? '');
                        $product = Product::where('sku', $productSku)->first();

                        if (!$product) {
                            $this->errors[] = "Row " . ($item['index'] + 2) . ": Product '{$productSku}' not found, skipped item.";
                            continue;
                        }

                        $quantity = (int) ($row['quantity'] ?? 0);
                        $unitPrice = (float) ($row['unit_price'] ?? 0);
                        $totalPrice = $quantity * $unitPrice;

                        $po->items()->create([
                            'product_id' => $product->id,
                            'quantity' => $quantity,
                            'unit_price' => $unitPrice,
                            'total_price' => $totalPrice,
                            'received_quantity' => 0,
                        ]);

                        $totalAmount += $totalPrice;
                    }

                    $po->update(['total_amount' => $totalAmount]);
                });

                $this->imported++;
            } catch (\Exception $e) {
                $this->skipped++;
                $this->errors[] = "Row {$rowNumber}: {$e->getMessage()}";
            }
        }
    }
}
