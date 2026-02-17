<?php

namespace App\Imports;

use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CategoryImport implements ToCollection, WithHeadingRow
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

                if (Category::where('name', $name)->exists()) {
                    $this->skipped++;
                    continue;
                }

                $slug = Str::slug($name);
                $originalSlug = $slug;
                $counter = 1;
                while (Category::where('slug', $slug)->exists()) {
                    $slug = $originalSlug . '-' . $counter++;
                }

                $parentId = null;
                $parentName = trim($row['parent'] ?? '');
                if (!empty($parentName)) {
                    $parent = Category::where('name', $parentName)->first();
                    $parentId = $parent?->id;
                }

                Category::create([
                    'name' => $name,
                    'slug' => $slug,
                    'description' => trim($row['description'] ?? '') ?: null,
                    'parent_id' => $parentId,
                ]);

                $this->imported++;
            } catch (\Exception $e) {
                $this->skipped++;
                $this->errors[] = "Row {$rowNumber}: {$e->getMessage()}";
            }
        }
    }
}
