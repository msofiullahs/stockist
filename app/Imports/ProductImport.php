<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductImport implements ToCollection, WithHeadingRow
{
    public int $imported = 0;
    public int $skipped = 0;
    public array $errors = [];

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            try {
                $name = trim($row['name'] ?? '');
                $sku = trim($row['sku'] ?? '');

                if (empty($name) || empty($sku)) {
                    $this->skipped++;
                    $this->errors[] = "Row {$rowNumber}: Name and SKU are required.";
                    continue;
                }

                if (Product::where('sku', $sku)->exists()) {
                    $this->skipped++;
                    continue;
                }

                $categoryId = null;
                $categoryName = trim($row['category'] ?? '');
                if (!empty($categoryName)) {
                    $category = Category::where('name', $categoryName)->first();
                    if (!$category) {
                        $this->skipped++;
                        $this->errors[] = "Row {$rowNumber}: Category '{$categoryName}' not found.";
                        continue;
                    }
                    $categoryId = $category->id;
                }

                if (!$categoryId) {
                    // category_id is required in the database
                    $defaultCategory = Category::first();
                    if ($defaultCategory) {
                        $categoryId = $defaultCategory->id;
                    } else {
                        $this->skipped++;
                        $this->errors[] = "Row {$rowNumber}: No category specified and no default category exists.";
                        continue;
                    }
                }

                $supplierId = null;
                $supplierName = trim($row['supplier'] ?? '');
                if (!empty($supplierName)) {
                    $supplier = Supplier::where('name', $supplierName)->first();
                    $supplierId = $supplier?->id;
                }

                Product::create([
                    'name' => $name,
                    'sku' => $sku,
                    'description' => trim($row['description'] ?? '') ?: null,
                    'category_id' => $categoryId,
                    'supplier_id' => $supplierId,
                    'unit' => trim($row['unit'] ?? 'Pieces') ?: 'Pieces',
                    'cost_price' => (float) ($row['cost_price'] ?? 0),
                    'selling_price' => (float) ($row['selling_price'] ?? 0),
                    'minimum_stock' => (int) ($row['minimum_stock'] ?? 0),
                    'is_active' => $this->parseBoolean($row['is_active'] ?? '1'),
                ]);

                $this->imported++;
            } catch (\Exception $e) {
                $this->skipped++;
                $this->errors[] = "Row {$rowNumber}: {$e->getMessage()}";
            }
        }
    }

    private function parseBoolean($value): bool
    {
        if (is_bool($value)) return $value;
        $val = strtolower(trim((string) $value));
        return in_array($val, ['1', 'yes', 'true', 'active']);
    }
}
