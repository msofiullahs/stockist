import { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import Badge from '@/Components/Badge';
import ConfirmModal from '@/Components/ConfirmModal';
import { PageProps, PurchaseOrder, PaginatedData } from '@/types';
import { useFormatCurrency } from '@/utils/currency';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps {
    orders: PaginatedData<PurchaseOrder>;
    filters: { search?: string; status?: string };
}

const statusColors: Record<string, string> = { draft: 'gray', pending: 'warning', approved: 'info', received: 'success', cancelled: 'error' };

export default function PurchaseOrdersIndex() {
    const { t } = useTranslation();
    const { orders, filters, auth } = usePage<Props>().props;
    const formatCurrency = useFormatCurrency();
    const canCreate = auth.user?.roles?.some((r: string) => ['admin', 'manager'].includes(r));
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/purchase-orders/${deleteId}`, {
            onFinish: () => { setDeleting(false); setDeleteId(null); },
        });
    };

    const columns = [
        { key: 'order_number', label: t('order_number'), render: (o: PurchaseOrder) => (
            <Link href={`/purchase-orders/${o.id}`} className="font-mono font-medium text-brand-500 hover:text-brand-600">{o.order_number}</Link>
        )},
        { key: 'supplier', label: t('supplier'), render: (o: PurchaseOrder) => o.supplier?.name || '-' },
        { key: 'status', label: t('status'), render: (o: PurchaseOrder) => <Badge variant={statusColors[o.status]}>{o.status.toUpperCase()}</Badge> },
        { key: 'items_count', label: t('items'), className: 'text-right' },
        { key: 'total_amount', label: t('total'), className: 'text-right', render: (o: PurchaseOrder) => <span className="font-semibold">{formatCurrency(o.total_amount)}</span> },
        { key: 'order_date', label: t('order_date') },
        { key: 'user', label: t('created_by'), render: (o: PurchaseOrder) => o.user?.name || '-' },
        ...(canCreate ? [{
            key: 'actions', label: '',
            render: (o: PurchaseOrder) => (
                <div className="flex items-center gap-1">
                    <Link href={`/purchase-orders/${o.id}`} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </Link>
                    {o.status === 'draft' && (
                        <button onClick={() => setDeleteId(o.id)} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-error-500">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                </div>
            ),
        }] : []),
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('purchase_orders')} />
            <PageHeader title={t('purchase_orders')} breadcrumbs={[{ label: t('dashboard'), href: '/dashboard' }, { label: t('purchase_orders') }]}
                actions={canCreate ? <Link href="/purchase-orders/create" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>{t('new_order')}</Link> : undefined}
            />
            <SearchFilter searchValue={filters.search} searchPlaceholder={t('search_order_number')} routeName="/purchase-orders"
                filters={[{ name: 'status', label: t('all_statuses'), value: filters.status, options: [
                    { label: t('draft'), value: 'draft' }, { label: t('pending'), value: 'pending' },
                    { label: t('approved'), value: 'approved' }, { label: t('received'), value: 'received' }, { label: t('cancelled'), value: 'cancelled' },
                ]}]}
            />
            <DataTable columns={columns} data={orders.data} />
            <Pagination links={orders.links} currentPage={orders.current_page} lastPage={orders.last_page} />

            <ConfirmModal
                show={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title={t('delete_purchase_order')}
                message={t('confirm_delete_purchase_order')}
                confirmLabel={t('delete')}
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}
