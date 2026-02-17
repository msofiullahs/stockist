import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable, { Column } from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import Badge from '@/Components/Badge';
import ConfirmModal from '@/Components/ConfirmModal';
import ImportModal from '@/Components/ImportModal';
import { PageProps, Product, PaginatedData, Category } from '@/types';
import { useFormatCurrency } from '@/utils/currency';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps {
    products: PaginatedData<Product>;
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
        stock_status?: string;
    };
}

export default function ProductIndex({ products, categories, filters }: Props) {
    const formatCurrency = useFormatCurrency();
    const { t } = useTranslation();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [showImport, setShowImport] = useState(false);

    const handleDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/products/${deleteId}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: Column<Product>[] = [
        {
            label: t('product'),
            render: (product) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800/50">
                                <svg className="h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div>
                        <Link href={`/products/${product.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-brand-500">{product.name}</Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                    </div>
                </div>
            ),
        },
        {
            label: t('category'),
            render: (product) => <span className="text-gray-600 dark:text-gray-400">{product.category || '-'}</span>,
        },
        {
            label: t('price'),
            render: (product) => (
                <div className="text-right">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{formatCurrency(product.selling_price)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('cost_price')}: {formatCurrency(product.cost_price)}</p>
                </div>
            ),
            className: 'text-right',
        },
        {
            label: t('stock'),
            render: (product) => (
                <div className="relative inline-flex items-center justify-center">
                    <span className="font-medium">{product.current_stock}</span>
                    {product.is_low_stock && (
                        <span className="group absolute -right-3 -top-1.5">
                            <span className="block h-2.5 w-2.5 rounded-full bg-error-500 ring-2 ring-white dark:ring-gray-800" />
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                {t('low_stock')}
                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                            </span>
                        </span>
                    )}
                </div>
            ),
            className: 'text-center',
        },
        {
            label: t('status'),
            render: (product) => <Badge variant={product.is_active ? 'success' : 'gray'}>{product.is_active ? t('active') : t('inactive')}</Badge>,
        },
        {
            label: t('actions'),
            render: (product) => (
                <div className="flex items-center gap-2">
                    <Link href={`/products/${product.id}`} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300" title={t('view')}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </Link>
                    <Link href={`/products/${product.id}/edit`} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand-500" title={t('edit')}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </Link>
                    <button onClick={() => setDeleteId(product.id)} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-error-500" title={t('delete')}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            ),
            className: 'w-32',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('products')} />
            <PageHeader title={t('products')} breadcrumbs={[{ label: t('dashboard'), href: '/dashboard' }, { label: t('products') }]}
                actions={
                    <>
                        <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" /></svg>
                            {t('import')}
                        </button>
                        <Link href="/products/create" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            {t('add_product')}
                        </Link>
                    </>
                }
            />
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="p-4">
                    <SearchFilter searchValue={filters.search || ''} searchPlaceholder={t('search_products')} url="/products" filterValues={filters}
                        filters={[
                            { name: 'category_id', label: t('all_categories'), options: categories.map((c) => ({ label: c.name, value: String(c.id) })) },
                            { name: 'stock_status', label: t('stock_status'), options: [{ label: t('in_stock'), value: 'in_stock' }, { label: t('low_stock'), value: 'low' }, { label: t('out_of_stock'), value: 'out_of_stock' }] },
                        ]}
                    />
                </div>
                <DataTable columns={columns} data={products.data} emptyMessage={t('no_products_found')} />
                <Pagination links={products.links} currentPage={products.current_page} lastPage={products.last_page} />
            </div>

            <ConfirmModal
                show={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title={t('delete_product')}
                message={t('confirm_delete_product')}
                confirmLabel={t('delete')}
                processing={deleting}
            />

            <ImportModal
                show={showImport}
                onClose={() => setShowImport(false)}
                importUrl="/import/products"
                templateUrl="/import/products/template"
                title={t('import_products')}
            />
        </AuthenticatedLayout>
    );
}
