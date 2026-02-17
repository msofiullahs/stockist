import { Head, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import Badge from '@/Components/Badge';
import { PageProps } from '@/types';
import { useFormatCurrency } from '@/utils/currency';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps {
    products: Array<any>;
    summary: { totalProducts: number; totalValue: number; lowStockCount: number };
    warehouses: Array<{ id: number; name: string }>;
    filters: any;
}

export default function StockReport() {
    const { t } = useTranslation();
    const { products, summary } = usePage<Props>().props;
    const formatCurrency = useFormatCurrency();

    return (
        <AuthenticatedLayout>
            <Head title={t('stock_report')} />
            <PageHeader title={t('stock_report')} breadcrumbs={[{ label: t('dashboard'), href: '/dashboard' }, { label: t('stock_report') }]}
                actions={
                    <div className="flex gap-2">
                        <a href="/exports/stock/pdf" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {t('pdf')}
                        </a>
                        <a href="/exports/stock/excel" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {t('excel')}
                        </a>
                        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            {t('print')}
                        </button>
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_products')}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.totalProducts}</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_stock_value')}</p>
                    <p className="mt-1 text-2xl font-bold text-brand-600">{formatCurrency(summary.totalValue)}</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('low_stock_items')}</p>
                    <p className="mt-1 text-2xl font-bold text-error-600">{summary.lowStockCount}</p>
                </div>
            </div>

            {/* Stock Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 print:border-0 print:shadow-none">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead><tr className="bg-gray-50 dark:bg-gray-800/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('product')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('sku')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('category')}</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('stock')}</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('min')}</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('cost')}</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('value')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('status')}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {products.map((p: any) => (
                            <tr key={p.id} className={p.is_low_stock ? 'bg-error-50/30 dark:bg-error-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.sku}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.category || '-'}</td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{p.current_stock} {p.unit}</td>
                                <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">{p.minimum_stock}</td>
                                <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{formatCurrency(p.cost_price)}</td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(p.stock_value)}</td>
                                <td className="px-4 py-3"><Badge variant={p.is_low_stock ? 'error' : 'success'}>{p.is_low_stock ? t('low_stock') : t('ok')}</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
