import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import Badge from '@/Components/Badge';
import { Product, StockMovement } from '@/types';
import { useFormatCurrency } from '@/utils/currency';
import { useTranslation } from '@/utils/translation';

interface WarehouseStock {
    id: number;
    name: string;
    location?: string;
    quantity: number;
}

interface ProductDetail extends Product {
    warehouses?: WarehouseStock[];
    stock_movements?: StockMovement[];
    created_at?: string;
    updated_at?: string;
}

interface Props {
    product: ProductDetail;
}

function ProductImagePlaceholder() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
            <svg className="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    );
}

export default function ProductShow({ product }: Props) {
    const formatCurrency = useFormatCurrency();
    const { t } = useTranslation();
    const warehouseStocks = product.warehouses || [];
    const recentMovements = product.stock_movements || [];

    return (
        <AuthenticatedLayout>
            <Head title={product.name} />

            <PageHeader
                title={product.name}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('products'), href: '/products' },
                    { label: product.name },
                ]}
                actions={
                    <Link
                        href={`/products/${product.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        {t('edit_product')}
                    </Link>
                }
            />

            {/* Product Details Card */}
            <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                    {/* Product Image */}
                    <div className="h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <ProductImagePlaceholder />
                        )}
                    </div>

                    {/* Product Info Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('sku')}</p>
                                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{product.sku}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('category')}</p>
                                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{product.category || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('supplier')}</p>
                                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{product.supplier || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('unit')}</p>
                                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{product.unit}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('cost_price')}</p>
                                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {formatCurrency(product.cost_price)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('selling_price')}</p>
                                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {formatCurrency(product.selling_price)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('current_stock')}</p>
                                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {product.current_stock} {product.unit}
                                    {product.is_low_stock && (
                                        <Badge variant="error">{t('low_stock')}</Badge>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('minimum_stock')}</p>
                                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{product.minimum_stock} {product.unit}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('status')}</p>
                                <div className="mt-1">
                                    <Badge variant={product.is_active ? 'success' : 'gray'}>
                                        {product.is_active ? t('active') : t('inactive')}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {product.description && (
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('description')}</p>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{product.description}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Warehouse Stocks */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('stock')} - {t('warehouse')}</h3>
                    {warehouseStocks.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">{t('no_data')}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('warehouse')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('quantity')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {warehouseStocks.map((ws) => (
                                        <tr key={ws.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ws.name}</td>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">{ws.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Recent Movements */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('recent_stock_movements')}</h3>
                    {recentMovements.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">{t('no_recent_movements')}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('type')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('quantity')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('warehouse')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('date')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {recentMovements.map((movement) => (
                                        <tr key={movement.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3 text-sm">
                                                <Badge variant={movement.type === 'in' ? 'success' : movement.type === 'out' ? 'error' : 'info'}>
                                                    {movement.type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{movement.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{movement.warehouse}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{movement.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
