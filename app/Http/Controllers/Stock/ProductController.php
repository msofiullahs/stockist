<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'supplier', 'warehouses']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($stockStatus = $request->input('stock_status')) {
            // Filtering by stock status is done after query via collection
        }

        $products = $query->orderBy('name')->paginate(15)->withQueryString();

        // Map through products to add computed fields
        $products->through(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'description' => $product->description,
                'category' => $product->category?->name,
                'supplier' => $product->supplier?->name,
                'category_id' => $product->category_id,
                'supplier_id' => $product->supplier_id,
                'unit' => $product->unit,
                'cost_price' => $product->cost_price,
                'selling_price' => $product->selling_price,
                'minimum_stock' => $product->minimum_stock,
                'current_stock' => $product->current_stock,
                'is_low_stock' => $product->isLowStock(),
                'is_active' => $product->is_active,
                'image' => $product->image ? Storage::disk('public')->url($product->image) : null,
            ];
        });

        // If stock_status filter is applied, we need to filter the results
        if ($stockStatus === 'low') {
            $allProducts = Product::with(['category', 'supplier', 'warehouses'])
                ->where('is_active', true);

            if ($search) {
                $allProducts->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            }
            if ($categoryId) {
                $allProducts->where('category_id', $categoryId);
            }

            $filtered = $allProducts->get()->filter(fn ($p) => $p->isLowStock());
            $page = $request->input('page', 1);
            $perPage = 15;
            $items = $filtered->slice(($page - 1) * $perPage, $perPage)->values();

            $products = new \Illuminate\Pagination\LengthAwarePaginator(
                $items->map(fn ($product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'description' => $product->description,
                    'category' => $product->category?->name,
                    'supplier' => $product->supplier?->name,
                    'category_id' => $product->category_id,
                    'supplier_id' => $product->supplier_id,
                    'unit' => $product->unit,
                    'cost_price' => $product->cost_price,
                    'selling_price' => $product->selling_price,
                    'minimum_stock' => $product->minimum_stock,
                    'current_stock' => $product->current_stock,
                    'is_low_stock' => true,
                    'is_active' => $product->is_active,
                    'image' => $product->image ? Storage::disk('public')->url($product->image) : null,
                ]),
                $filtered->count(),
                $perPage,
                $page,
                ['path' => request()->url(), 'query' => request()->query()]
            );
        }

        return Inertia::render('Stock/Products/Index', [
            'products' => $products,
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['search', 'category_id', 'stock_status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Stock/Products/Form', [
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'suppliers' => Supplier::select('id', 'name')->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:50', 'unique:products,sku'],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', 'exists:categories,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'unit' => ['required', 'string', 'max:20'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'minimum_stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        Product::create($validated);

        return redirect()->route('products.index')
            ->with('success', 'flash_product_created');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'supplier', 'warehouses', 'stockMovements' => function ($q) {
            $q->with(['warehouse', 'user'])->orderByDesc('date')->take(20);
        }]);

        return Inertia::render('Stock/Products/Show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'description' => $product->description,
                'category' => $product->category?->name,
                'supplier' => $product->supplier?->name,
                'unit' => $product->unit,
                'cost_price' => $product->cost_price,
                'selling_price' => $product->selling_price,
                'minimum_stock' => $product->minimum_stock,
                'current_stock' => $product->current_stock,
                'is_low_stock' => $product->isLowStock(),
                'is_active' => $product->is_active,
                'image' => $product->image ? Storage::disk('public')->url($product->image) : null,
                'warehouses' => $product->warehouses->map(fn ($wh) => [
                    'id' => $wh->id,
                    'name' => $wh->name,
                    'location' => $wh->location,
                    'quantity' => $wh->pivot->quantity,
                ]),
                'stock_movements' => $product->stockMovements->map(fn ($m) => [
                    'id' => $m->id,
                    'type' => $m->type,
                    'quantity' => $m->quantity,
                    'date' => $m->date->format('Y-m-d'),
                    'warehouse' => $m->warehouse?->name,
                    'user' => $m->user?->name,
                    'notes' => $m->notes,
                ]),
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ],
        ]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('Stock/Products/Form', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'description' => $product->description,
                'category_id' => $product->category_id,
                'supplier_id' => $product->supplier_id,
                'unit' => $product->unit,
                'cost_price' => $product->cost_price,
                'selling_price' => $product->selling_price,
                'minimum_stock' => $product->minimum_stock,
                'is_active' => $product->is_active,
                'image' => $product->image ? Storage::disk('public')->url($product->image) : null,
            ],
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'suppliers' => Supplier::select('id', 'name')->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:50', 'unique:products,sku,' . $product->id],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', 'exists:categories,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'unit' => ['required', 'string', 'max:20'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'minimum_stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        // Handle image removal
        if ($request->boolean('remove_image') && $product->image) {
            Storage::disk('public')->delete($product->image);
            $validated['image'] = null;
        }

        $product->update($validated);

        return redirect()->route('products.index')
            ->with('success', 'flash_product_updated');
    }

    public function destroy(Product $product)
    {
        if ($product->stockMovements()->count() > 0) {
            return back()->with('error', 'flash_product_cannot_delete');
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'flash_product_deleted');
    }
}
