import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable, { Column } from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import Badge from '@/Components/Badge';
import ImportModal from '@/Components/ImportModal';
import { PageProps, StockMovement, PaginatedData, Warehouse } from '@/types';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps {
    movements: PaginatedData<StockMovement>;
    warehouses: Warehouse[];
    filters: {
        search?: string;
        type?: string;
        warehouse_id?: string;
    };
}

const typeVariant = (type: string) => {
    switch (type) {
        case 'in': return 'success';
        case 'out': return 'error';
        case 'adjustment': return 'warning';
        case 'transfer': return 'info';
        default: return 'gray';
    }
};

export default function MovementIndex({ movements, warehouses, filters }: Props) {
    const { t } = useTranslation();
    const [showImport, setShowImport] = useState(false);

    const columns: Column<StockMovement>[] = [
        {
            label: t('date'),
            render: (m) => <span className="text-gray-500 dark:text-gray-400">{m.date}</span>,
        },
        {
            label: t('product'),
            render: (m) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{m.product}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('sku')}: {m.sku}</p>
                </div>
            ),
        },
        {
            label: t('type'),
            render: (m) => (
                <Badge variant={typeVariant(m.type)}>
                    {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
                </Badge>
            ),
        },
        {
            label: t('quantity'),
            render: (m) => (
                <span className={`font-medium ${m.type === 'in' ? 'text-success-500' : m.type === 'out' ? 'text-error-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {m.type === 'in' ? '+' : m.type === 'out' ? '-' : ''}{m.quantity}
                </span>
            ),
        },
        {
            label: t('warehouse'),
            render: (m) => <span className="text-gray-600 dark:text-gray-400">{m.warehouse}</span>,
        },
        {
            label: t('created_by'),
            render: (m) => <span className="text-gray-600 dark:text-gray-400">{m.user}</span>,
        },
        {
            label: t('notes'),
            render: (m) => (
                <span className="max-w-xs truncate text-gray-500 dark:text-gray-400">{m.notes || '-'}</span>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('stock_movement')} />

            <PageHeader
                title={t('stock_movement')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('stock_movement') },
                ]}
                actions={
                    <>
                        <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" /></svg>
                            {t('import')}
                        </button>
                        <Link
                            href="/stock-movements/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('record_movement')}
                        </Link>
                    </>
                }
            />

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="p-4">
                    <SearchFilter
                        searchValue={filters.search || ''}
                        searchPlaceholder={t('search_products')}
                        url="/stock-movements"
                        filterValues={filters}
                        filters={[
                            {
                                name: 'type',
                                label: t('all_types'),
                                options: [
                                    { label: t('stock_in'), value: 'in' },
                                    { label: t('stock_out'), value: 'out' },
                                    { label: t('adjustment'), value: 'adjustment' },
                                    { label: t('transfer'), value: 'transfer' },
                                ],
                            },
                            {
                                name: 'warehouse_id',
                                label: t('all_warehouses'),
                                options: warehouses.map((w) => ({
                                    label: w.name,
                                    value: String(w.id),
                                })),
                            },
                        ]}
                    />
                </div>

                <DataTable columns={columns} data={movements.data} emptyMessage={t('no_movements_found')} />

                <Pagination
                    links={movements.links}
                    currentPage={movements.current_page}
                    lastPage={movements.last_page}
                />
            </div>

            <ImportModal
                show={showImport}
                onClose={() => setShowImport(false)}
                importUrl="/import/stock-movements"
                templateUrl="/import/stock-movements/template"
                title={t('import_movements')}
            />
        </AuthenticatedLayout>
    );
}
