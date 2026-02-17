<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Stock\CategoryController;
use App\Http\Controllers\Stock\ProductController;
use App\Http\Controllers\Stock\SupplierController;
use App\Http\Controllers\Stock\WarehouseController;
use App\Http\Controllers\Stock\StockMovementController;
use App\Http\Controllers\Stock\PurchaseOrderController;
use App\Http\Controllers\Stock\StockAdjustmentController;
use App\Http\Controllers\Stock\ReportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TranslationController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login')->middleware('guest');
Route::post('/login', [LoginController::class, 'login'])->middleware('guest');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout')->middleware('auth');

Route::redirect('/', '/dashboard');

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::get('/profile/password', [ProfileController::class, 'password'])->name('profile.password');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');

    // Stock Management
    Route::resource('categories', CategoryController::class)->except(['show']);
    Route::resource('products', ProductController::class);
    Route::resource('suppliers', SupplierController::class)->except(['show']);
    Route::resource('warehouses', WarehouseController::class)->except(['show']);
    Route::resource('stock-movements', StockMovementController::class)->only(['index', 'create', 'store']);
    Route::resource('stock-adjustments', StockAdjustmentController::class)->only(['index', 'create', 'store']);

    // Purchase Orders
    Route::resource('purchase-orders', PurchaseOrderController::class)->except(['edit', 'update']);
    Route::post('purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
    Route::patch('purchase-orders/{purchaseOrder}/status', [PurchaseOrderController::class, 'updateStatus'])->name('purchase-orders.status');

    // Reports
    Route::get('/reports/stock', [ReportController::class, 'stockReport'])->name('reports.stock');
    Route::get('/reports/movements', [ReportController::class, 'movementReport'])->name('reports.movements');

    // Exports
    Route::get('/exports/stock/pdf', [ReportController::class, 'exportStockPdf'])->name('exports.stock.pdf');
    Route::get('/exports/stock/excel', [ReportController::class, 'exportStockExcel'])->name('exports.stock.excel');
    Route::get('/exports/movements/pdf', [ReportController::class, 'exportMovementPdf'])->name('exports.movements.pdf');
    Route::get('/exports/movements/excel', [ReportController::class, 'exportMovementExcel'])->name('exports.movements.excel');

    // Settings & User Management (admin only)
    Route::middleware(['role:admin'])->group(function () {
        Route::resource('users', UserManagementController::class)->except(['show']);
        Route::get('/settings/general', [SettingsController::class, 'general'])->name('settings.general');
        Route::put('/settings/general', [SettingsController::class, 'update'])->name('settings.update');
        Route::get('/settings/translations', [TranslationController::class, 'index'])->name('settings.translations');
        Route::put('/settings/translations', [TranslationController::class, 'update'])->name('settings.translations.update');
    });
});
