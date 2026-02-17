<?php

namespace App\Imports;

use App\Models\Warehouse;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class WarehouseImport implements ToCollection, WithHeadingRow
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
                if (empty($name)) {
                    $this->skipped++;
                    $this->errors[] = "Row {$rowNumber}: Name is required.";
                    continue;
                }

                if (Warehouse::where('name', $name)->exists()) {
                    $this->skipped++;
                    continue;
                }

                Warehouse::create([
                    'name' => $name,
                    'location' => trim($row['location'] ?? '') ?: null,
                    'address' => trim($row['address'] ?? '') ?: null,
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
