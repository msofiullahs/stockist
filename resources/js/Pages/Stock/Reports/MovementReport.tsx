import { Head, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import Badge from '@/Components/Badge';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps {
    movements: Array<any>;
    summary: { totalIn: number; totalOut: number; totalAdjustments: number };
    warehouses: Array<{ id: number; name: string }>;
    filters: { date_from: string; date_to: string; type?: string; warehouse?: string };
}

export default function MovementReport() {
    const { t } = useTranslation();
    const { movements, summary, warehouses, filters } = usePage<Props>().props;
    const { data, setData, get } = useForm(filters);

    const applyFilters = () => get('/reports/movements', { preserveState: true });

    return (
        <AuthenticatedLayout>
            <Head title={t('movement_report')} />
            <PageHeader title={t('movement_report')} breadcrumbs={[{ label: t('dashboard'), href: '/dashboard' }, { label: t('movement_report') }]}
                actions={
                    <div className="flex gap-2">
                        <a href={`/exports/movements/pdf?date_from=${filters.date_from}&date_to=${filters.date_to}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('pdf')}</a>
                        <a href={`/exports/movements/excel?date_from=${filters.date_from}&date_to=${filters.date_to}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('excel')}</a>
                        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('print')}</button>
                    </div>
                }
            />

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div><label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{t('from')}</label><input type="date" value={data.date_from} onChange={e => setData('date_from', e.target.value)} className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm" /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{t('to')}</label><input type="date" value={data.date_to} onChange={e => setData('date_to', e.target.value)} className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm" /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{t('type')}</label><select value={data.type || ''} onChange={e => setData('type', e.target.value)} className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"><option value="">{t('all')}</option><option value="in">{t('stock_in')}</option><option value="out">{t('stock_out')}</option><option value="adjustment">{t('adjustment')}</option></select></div>
                <button onClick={applyFilters} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">{t('apply')}</button>
            </div>

            {/* Summary */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"><p className="text-sm text-gray-500 dark:text-gray-400">{t('total_in')}</p><p className="mt-1 text-2xl font-bold text-success-600">+{summary.totalIn}</p></div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"><p className="text-sm text-gray-500 dark:text-gray-400">{t('total_out')}</p><p className="mt-1 text-2xl font-bold text-error-600">-{summary.totalOut}</p></div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"><p className="text-sm text-gray-500 dark:text-gray-400">{t('adjustments')}</p><p className="mt-1 text-2xl font-bold text-warning-600">{summary.totalAdjustments}</p></div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead><tr className="bg-gray-50 dark:bg-gray-800/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('date')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('product')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('warehouse')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('type')}</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('quantity')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('notes')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('created_by')}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {movements.map((m: any) => (
                            <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{m.date}</td>
                                <td className="px-4 py-3 text-sm"><span className="font-medium text-gray-900 dark:text-gray-100">{m.product}</span><span className="ml-1 text-xs text-gray-400 dark:text-gray-500">{m.sku}</span></td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{m.warehouse}</td>
                                <td className="px-4 py-3"><Badge variant={m.type === 'in' ? 'success' : m.type === 'out' ? 'error' : 'warning'}>{m.type.toUpperCase()}</Badge></td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{m.quantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{m.notes || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{m.user}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {movements.length === 0 && <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">{t('no_movements_in_period')}</p>}
            </div>
        </AuthenticatedLayout>
    );
}
