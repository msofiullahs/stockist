import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable, { Column } from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import Badge from '@/Components/Badge';
import { PageProps, StockAdjustment, PaginatedData } from '@/types';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps {
    adjustments: PaginatedData<StockAdjustment>;
    filters: {
        search?: string;
    };
}

export default function AdjustmentIndex({ adjustments, filters }: Props) {
    const { t } = useTranslation();

    const columns: Column<StockAdjustment>[] = [
        {
            label: t('date'),
            render: (adj) => <span className="text-gray-500 dark:text-gray-400">{adj.date}</span>,
        },
        {
            label: t('product'),
            render: (adj) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{adj.product}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('sku')}: {adj.sku}</p>
                </div>
            ),
        },
        {
            label: t('warehouse'),
            render: (adj) => <span className="text-gray-600 dark:text-gray-400">{adj.warehouse}</span>,
        },
        {
            label: t('type'),
            render: (adj) => (
                <Badge variant={adj.adjustment_type === 'addition' ? 'success' : adj.adjustment_type === 'subtraction' ? 'error' : 'warning'}>
                    {adj.adjustment_type}
                </Badge>
            ),
        },
        {
            label: t('before'),
            render: (adj) => <span className="text-gray-600 dark:text-gray-400">{adj.quantity_before}</span>,
        },
        {
            label: t('after'),
            render: (adj) => <span className="font-medium text-gray-800 dark:text-gray-200">{adj.quantity_after}</span>,
        },
        {
            label: t('difference'),
            render: (adj) => (
                <span className={`font-medium ${adj.difference > 0 ? 'text-success-500' : adj.difference < 0 ? 'text-error-500' : 'text-gray-600 dark:text-gray-400'}`}>
                    {adj.difference > 0 ? '+' : ''}{adj.difference}
                </span>
            ),
        },
        {
            label: t('reason'),
            render: (adj) => (
                <span className="max-w-xs truncate text-gray-500 dark:text-gray-400">{adj.reason || '-'}</span>
            ),
        },
        {
            label: t('created_by'),
            render: (adj) => <span className="text-gray-600 dark:text-gray-400">{adj.user}</span>,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('adjustments')} />

            <PageHeader
                title={t('adjustments')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('adjustments') },
                ]}
                actions={
                    <Link
                        href="/stock-adjustments/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('new_adjustment')}
                    </Link>
                }
            />

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="p-4">
                    <SearchFilter
                        searchValue={filters.search || ''}
                        searchPlaceholder={t('search_adjustments')}
                        url="/stock-adjustments"
                        filterValues={filters}
                    />
                </div>

                <DataTable columns={columns} data={adjustments.data} emptyMessage={t('no_adjustments_found')} />

                <Pagination
                    links={adjustments.links}
                    currentPage={adjustments.current_page}
                    lastPage={adjustments.last_page}
                />
            </div>
        </AuthenticatedLayout>
    );
}
