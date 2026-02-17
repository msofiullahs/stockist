<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Warehouse;
use App\Models\StockMovement;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StockMovementImport implements ToCollection, WithHeadingRow
{
    public int $imported = 0;
    public int $skipped = 0;
    public array $errors = [];

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            try {
                $productSku = trim($row['product_sku'] ?? '');
                $warehouseName = trim($row['warehouse'] ?? '');
                $type = strtolower(trim($row['type'] ?? ''));
                $quantity = (int) ($row['quantity'] ?? 0);
                $date = trim($row['date'] ?? now()->toDateString());

                if (empty($productSku) || empty($warehouseName) || !in_array($type, ['in', 'out']) || $quantity <= 0) {
                    $this->skipped++;
                    $this->errors[] = "Row {$rowNumber}: Missing required fields or invalid type/quantity.";
                    continue;
                }

                $product = Product::where('sku', $productSku)->first();
                if (!$product) {
                    $this->skipped++;
                    $this->errors[] = "Row {$rowNumber}: Product with SKU '{$productSku}' not found.";
                    continue;
                }

                $warehouse = Warehouse::where('name', $warehouseName)->first();
                if (!$warehouse) {
                    $this->skipped++;
                    $this->errors[] = "Row {$rowNumber}: Warehouse '{$warehouseName}' not found.";
                    continue;
                }

                DB::transaction(function () use ($product, $warehouse, $type, $quantity, $date, $row) {
                    StockMovement::create([
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouse->id,
                        'user_id' => Auth::id(),
                        'type' => $type,
                        'quantity' => $quantity,
                        'notes' => trim($row['notes'] ?? '') ?: null,
                        'date' => $date,
                    ]);

                    $currentQty = DB::table('warehouse_stocks')
                        ->where('product_id', $product->id)
                        ->where('warehouse_id', $warehouse->id)
                        ->value('quantity') ?? 0;

                    $newQty = $type === 'in' ? $currentQty + $quantity : max(0, $currentQty - $quantity);

                    DB::table('warehouse_stocks')->updateOrInsert(
                        ['product_id' => $product->id, 'warehouse_id' => $warehouse->id],
                        ['quantity' => $newQty, 'updated_at' => now()]
                    );
                });

                $this->imported++;
            } catch (\Exception $e) {
                $this->skipped++;
                $this->errors[] = "Row {$rowNumber}: {$e->getMessage()}";
            }
        }
    }
}
