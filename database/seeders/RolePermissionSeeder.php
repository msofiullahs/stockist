<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $modules = ['products', 'categories', 'suppliers', 'warehouses', 'stock-movements', 'stock-adjustments', 'purchase-orders', 'reports', 'users'];
        $actions = ['view', 'create', 'edit', 'delete'];

        $permissions = [];
        foreach ($modules as $module) {
            foreach ($actions as $action) {
                $permissions[] = Permission::firstOrCreate(['name' => "{$action} {$module}"]);
            }
        }

        // Admin - full access
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());

        // Manager - everything except user management
        $manager = Role::firstOrCreate(['name' => 'manager']);
        $managerPerms = Permission::where('name', 'not like', '%users%')->get();
        $manager->givePermissionTo($managerPerms);

        // Staff - basic stock operations
        $staff = Role::firstOrCreate(['name' => 'staff']);
        $staff->givePermissionTo([
            'view products', 'create products', 'edit products',
            'view categories',
            'view suppliers',
            'view warehouses',
            'view stock-movements', 'create stock-movements',
            'view stock-adjustments', 'create stock-adjustments',
            'view purchase-orders',
            'view reports',
        ]);

        // Viewer - read only
        $viewer = Role::firstOrCreate(['name' => 'viewer']);
        $viewPerms = Permission::where('name', 'like', 'view%')->where('name', 'not like', '%users%')->get();
        $viewer->givePermissionTo($viewPerms);
    }
}
