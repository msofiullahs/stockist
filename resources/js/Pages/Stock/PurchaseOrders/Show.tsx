import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import Badge from '@/Components/Badge';
import ConfirmModal from '@/Components/ConfirmModal';
import { PageProps, PurchaseOrder } from '@/types';
import { useFormatCurrency } from '@/utils/currency';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps { order: PurchaseOrder; }

const statusColors: Record<string, string> = { draft: 'gray', pending: 'warning', approved: 'info', received: 'success', cancelled: 'error' };

export default function PurchaseOrderShow() {
    const { t } = useTranslation();
    const { order, auth } = usePage<Props>().props;
    const formatCurrency = useFormatCurrency();
    const canManage = auth.user?.roles?.some((r: string) => ['admin', 'manager'].includes(r));

    const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleStatusChange = () => {
        if (!confirmStatus) return;
        setProcessing(true);
        router.patch(`/purchase-orders/${order.id}/status`, { status: confirmStatus }, {
            onFinish: () => { setProcessing(false); setConfirmStatus(null); },
        });
    };

    const statusLabels: Record<string, string> = {
        pending: t('submit'),
        approved: t('approve'),
        cancelled: t('cancel_order'),
    };

    return (
        <AuthenticatedLayout>
            <Head title={`PO: ${order.order_number}`} />
            <PageHeader
                title={`${t('purchase_order')}: ${order.order_number}`}
                breadcrumbs={[{ label: t('dashboard'), href: '/dashboard' }, { label: t('purchase_orders'), href: '/purchase-orders' }, { label: order.order_number }]}
                actions={canManage && order.status !== 'received' && order.status !== 'cancelled' ? (
                    <div className="flex gap-2">
                        {order.status === 'draft' && <button onClick={() => setConfirmStatus('pending')} className="rounded-lg bg-warning-500 px-4 py-2 text-sm font-semibold text-white hover:bg-warning-600">{t('submit')}</button>}
                        {order.status === 'pending' && <button onClick={() => setConfirmStatus('approved')} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">{t('approve')}</button>}
                        <button onClick={() => setConfirmStatus('cancelled')} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('cancel_order')}</button>
                    </div>
                ) : undefined}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                        <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('order_items')}</h3>
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                <th className="pb-3">{t('product')}</th><th className="pb-3 text-right">{t('quantity')}</th><th className="pb-3 text-right">{t('unit_price')}</th><th className="pb-3 text-right">{t('total')}</th>
                            </tr></thead>
                            <tbody>
                                {order.items?.map((item: any) => (
                                    <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700/50">
                                        <td className="py-3"><p className="font-medium text-gray-900 dark:text-gray-100">{item.product?.name}</p><p className="text-xs text-gray-400 dark:text-gray-500">{item.product?.sku}</p></td>
                                        <td className="py-3 text-right text-gray-700 dark:text-gray-300">{item.quantity}</td>
                                        <td className="py-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.unit_price)}</td>
                                        <td className="py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(item.total_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot><tr><td colSpan={3} className="pt-3 text-right font-semibold text-gray-900 dark:text-gray-100">{t('total')}:</td><td className="pt-3 text-right text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(order.total_amount)}</td></tr></tfoot>
                        </table>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                    <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('order_info')}</h3>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">{t('status')}</dt><dd><Badge variant={statusColors[order.status]}>{order.status.toUpperCase()}</Badge></dd></div>
                        <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">{t('supplier')}</dt><dd className="font-medium text-gray-900 dark:text-gray-100">{order.supplier?.name}</dd></div>
                        <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">{t('order_date')}</dt><dd className="text-gray-900 dark:text-gray-100">{order.order_date}</dd></div>
                        {order.expected_date && <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">{t('expected_date')}</dt><dd className="text-gray-900 dark:text-gray-100">{order.expected_date}</dd></div>}
                        {order.received_date && <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">{t('received_date')}</dt><dd className="text-gray-900 dark:text-gray-100">{order.received_date}</dd></div>}
                        <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">{t('created_by')}</dt><dd className="text-gray-900 dark:text-gray-100">{order.user?.name}</dd></div>
                    </dl>
                    {order.notes && <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3"><p className="text-xs text-gray-500 dark:text-gray-400">{order.notes}</p></div>}
                </div>
            </div>

            <ConfirmModal
                show={confirmStatus !== null}
                onClose={() => setConfirmStatus(null)}
                onConfirm={handleStatusChange}
                title={t('change_order_status')}
                message={`${t('are_you_sure')} ${t('change_order_status').toLowerCase()} → ${confirmStatus ? confirmStatus.toUpperCase() : ''}?`}
                confirmLabel={confirmStatus ? (statusLabels[confirmStatus] || confirmStatus) : t('confirm')}
                variant={confirmStatus === 'cancelled' ? 'danger' : confirmStatus === 'approved' ? 'info' : 'warning'}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}
