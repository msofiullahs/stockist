<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        $admin = User::create(['name' => 'Admin User', 'email' => 'admin@stockist.test', 'password' => Hash::make('password')]);
        $admin->assignRole('admin');

        $manager = User::create(['name' => 'Manager User', 'email' => 'manager@stockist.test', 'password' => Hash::make('password')]);
        $manager->assignRole('manager');

        $staff = User::create(['name' => 'Staff User', 'email' => 'staff@stockist.test', 'password' => Hash::make('password')]);
        $staff->assignRole('staff');

        $viewer = User::create(['name' => 'Viewer User', 'email' => 'viewer@stockist.test', 'password' => Hash::make('password')]);
        $viewer->assignRole('viewer');

        // Categories
        $categories = [];
        $catNames = ['Electronics', 'Office Supplies', 'Furniture', 'Raw Materials', 'Packaging'];
        foreach ($catNames as $name) {
            $categories[] = Category::create(['name' => $name, 'slug' => Str::slug($name), 'description' => "All {$name} items"]);
        }

        // Suppliers
        $suppliers = [];
        $suppNames = [
            ['name' => 'TechParts Inc.', 'email' => 'sales@techparts.com', 'city' => 'San Francisco', 'country' => 'USA'],
            ['name' => 'Global Office', 'email' => 'info@globaloffice.com', 'city' => 'London', 'country' => 'UK'],
            ['name' => 'Furniture World', 'email' => 'orders@furnitureworld.com', 'city' => 'Tokyo', 'country' => 'Japan'],
        ];
        foreach ($suppNames as $s) {
            $suppliers[] = Supplier::create(array_merge($s, ['contact_person' => 'Sales Team', 'phone' => '+1-555-0100', 'is_active' => true]));
        }

        // Warehouses
        $warehouses = [];
        $whNames = [
            ['name' => 'Main Warehouse', 'location' => 'Building A', 'address' => '123 Industrial Ave'],
            ['name' => 'East Wing Storage', 'location' => 'Building B', 'address' => '456 Storage Blvd'],
        ];
        foreach ($whNames as $w) {
            $warehouses[] = Warehouse::create(array_merge($w, ['is_active' => true]));
        }

        // Products
        $productData = [
            ['name' => 'Laptop Stand Pro', 'sku' => 'ELEC-001', 'cat' => 0, 'sup' => 0, 'cost' => 25.00, 'sell' => 49.99, 'min' => 10],
            ['name' => 'USB-C Hub 7in1', 'sku' => 'ELEC-002', 'cat' => 0, 'sup' => 0, 'cost' => 15.00, 'sell' => 34.99, 'min' => 20],
            ['name' => 'Wireless Mouse', 'sku' => 'ELEC-003', 'cat' => 0, 'sup' => 0, 'cost' => 8.00, 'sell' => 19.99, 'min' => 50],
            ['name' => 'A4 Copy Paper (Ream)', 'sku' => 'OFF-001', 'cat' => 1, 'sup' => 1, 'cost' => 3.50, 'sell' => 6.99, 'min' => 100],
            ['name' => 'Ballpoint Pens (Box)', 'sku' => 'OFF-002', 'cat' => 1, 'sup' => 1, 'cost' => 2.00, 'sell' => 4.99, 'min' => 80],
            ['name' => 'Sticky Notes Pack', 'sku' => 'OFF-003', 'cat' => 1, 'sup' => 1, 'cost' => 1.50, 'sell' => 3.49, 'min' => 60],
            ['name' => 'Office Desk Standard', 'sku' => 'FURN-001', 'cat' => 2, 'sup' => 2, 'cost' => 120.00, 'sell' => 249.99, 'min' => 5],
            ['name' => 'Ergonomic Chair', 'sku' => 'FURN-002', 'cat' => 2, 'sup' => 2, 'cost' => 150.00, 'sell' => 329.99, 'min' => 5],
            ['name' => 'Filing Cabinet 3-Drawer', 'sku' => 'FURN-003', 'cat' => 2, 'sup' => 2, 'cost' => 65.00, 'sell' => 129.99, 'min' => 8],
            ['name' => 'Steel Sheet 1mm', 'sku' => 'RAW-001', 'cat' => 3, 'sup' => 0, 'cost' => 45.00, 'sell' => 60.00, 'min' => 25],
            ['name' => 'Bubble Wrap Roll', 'sku' => 'PACK-001', 'cat' => 4, 'sup' => 1, 'cost' => 12.00, 'sell' => 22.00, 'min' => 30],
            ['name' => 'Cardboard Box (Large)', 'sku' => 'PACK-002', 'cat' => 4, 'sup' => 1, 'cost' => 1.20, 'sell' => 2.50, 'min' => 200],
        ];

        $products = [];
        foreach ($productData as $p) {
            $products[] = Product::create([
                'name' => $p['name'], 'sku' => $p['sku'],
                'category_id' => $categories[$p['cat']]->id,
                'supplier_id' => $suppliers[$p['sup']]->id,
                'unit' => 'pcs', 'cost_price' => $p['cost'], 'selling_price' => $p['sell'],
                'minimum_stock' => $p['min'], 'is_active' => true,
            ]);
        }

        // Stock movements and warehouse stock
        foreach ($products as $product) {
            foreach ($warehouses as $wh) {
                $qty = rand(5, 150);
                DB::table('warehouse_stocks')->insert([
                    'warehouse_id' => $wh->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Create stock-in movements over last 6 months
                for ($i = 0; $i < rand(3, 8); $i++) {
                    StockMovement::create([
                        'product_id' => $product->id,
                        'warehouse_id' => $wh->id,
                        'user_id' => $admin->id,
                        'type' => collect(['in', 'out'])->random(),
                        'quantity' => rand(5, 50),
                        'notes' => 'Demo stock movement',
                        'date' => Carbon::now()->subDays(rand(1, 180)),
                    ]);
                }
            }
        }
    }
}
