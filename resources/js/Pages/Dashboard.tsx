import { Head, Link, router, usePage } from '@inertiajs/react';
import { lazy, Suspense, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import StatsCard from '@/Components/StatsCard';
import Badge from '@/Components/Badge';
import ConfirmModal from '@/Components/ConfirmModal';
import { DashboardStats, Product, StockMovement, StorageUsage, PageProps } from '@/types';
import { useTranslation } from '@/utils/translation';

const Chart = lazy(() => import('react-apexcharts'));

interface Props {
    stats: DashboardStats;
    lowStockProducts: Product[];
    recentMovements: StockMovement[];
    monthlyMovements?: { month: string; in: number; out: number }[];
    storageUsage?: StorageUsage;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i];
}

export default function Dashboard({
    stats,
    lowStockProducts = [],
    recentMovements = [],
    monthlyMovements = [],
    storageUsage,
}: Props) {
    const { t } = useTranslation();
    const { settings } = usePage<PageProps>().props;
    const isDark = settings?.theme === 'dark';
    const currencySymbol = settings?.currency_symbol || '$';

    const formatCurrency = (n: number) => {
        if (!Number.isFinite(n)) return `${currencySymbol}0`;
        const abs = Math.abs(n);
        if (abs >= 1_000_000_000) return `${currencySymbol}${(n / 1_000_000_000).toFixed(2)}B`;
        if (abs >= 1_000_000) return `${currencySymbol}${(n / 1_000_000).toFixed(2)}M`;
        if (abs >= 1_000) return `${currencySymbol}${(n / 1_000).toFixed(1)}K`;
        return `${currencySymbol}${n.toFixed(0)}`;
    };

    const [showCleanModal, setShowCleanModal] = useState(false);
    const [cleanProcessing, setCleanProcessing] = useState(false);

    const handleCleanCache = () => {
        setCleanProcessing(true);
        router.post('/dashboard/clean-cache', {}, {
            onSuccess: () => {
                setShowCleanModal(false);
                setCleanProcessing(false);
            },
            onError: () => {
                setCleanProcessing(false);
            },
        });
    };

    const chartOptions: ApexCharts.ApexOptions = {
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', background: 'transparent' },
        colors: ['#3366FF', '#EF4444'],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
        dataLabels: { enabled: false },
        xaxis: {
            categories: monthlyMovements.map((m) => m.month),
            labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280' } },
        },
        yaxis: {
            labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280' } },
        },
        legend: { position: 'top', labels: { colors: isDark ? '#d1d5db' : '#374151' } },
        grid: { borderColor: isDark ? '#374151' : '#f1f1f1' },
        theme: { mode: isDark ? 'dark' : 'light' },
        tooltip: { theme: isDark ? 'dark' : 'light' },
    };

    const chartSeries = [
        { name: t('stock_in'), data: monthlyMovements.map((m) => m.in) },
        { name: t('stock_out'), data: monthlyMovements.map((m) => m.out) },
    ];

    const storagePercentage = storageUsage?.percentage ?? 0;
    const storageColor = storagePercentage >= 80 ? '#EF4444' : storagePercentage >= 60 ? '#F59E0B' : '#3366FF';

    const storageChartOptions: ApexCharts.ApexOptions = {
        chart: { type: 'radialBar', background: 'transparent' },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: { size: '65%' },
                track: {
                    background: isDark ? '#374151' : '#e5e7eb',
                    strokeWidth: '100%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '13px',
                        fontWeight: '500',
                        color: isDark ? '#9ca3af' : '#6b7280',
                        offsetY: -10,
                    },
                    value: {
                        show: true,
                        fontSize: '28px',
                        fontWeight: '700',
                        color: isDark ? '#f3f4f6' : '#111827',
                        offsetY: 4,
                        formatter: (val: number) => `${val}%`,
                    },
                },
            },
        },
        fill: { colors: [storageColor] },
        stroke: { lineCap: 'round' },
        labels: [t('used')],
        theme: { mode: isDark ? 'dark' : 'light' },
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('dashboard')} />

            <PageHeader title={t('dashboard')} breadcrumbs={[{ label: t('dashboard') }]} />

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatsCard
                    title={t('total_products')}
                    value={stats.totalProducts}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    }
                />
                <StatsCard
                    title={t('categories')}
                    value={stats.totalCategories}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    }
                />
                <StatsCard
                    title={t('suppliers')}
                    value={stats.totalSuppliers}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                />
                <StatsCard
                    title={t('warehouses')}
                    value={stats.totalWarehouses}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                />
                <StatsCard
                    title={t('pending_orders')}
                    value={stats.pendingOrders}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                />
                <StatsCard
                    title={t('low_stock_alerts')}
                    value={stats.lowStockCount}
                    variant={stats.lowStockCount > 0 ? 'error' : 'default'}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    }
                />
                <StatsCard
                    title={t('inventory_value', 'Inventory Value')}
                    value={formatCurrency(stats.inventoryValue ?? 0)}
                    trend={{
                        value: t('at_cost', 'at cost') + ' · ' + (stats.totalUnits ?? 0).toLocaleString() + ' ' + t('units', 'units'),
                        positive: true,
                    }}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatsCard
                    title={t('retail_value', 'Retail Value')}
                    value={formatCurrency(stats.retailValue ?? 0)}
                    trend={{
                        value: t('at_selling_price', 'at selling price'),
                        positive: true,
                    }}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Movement Chart */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 xl:col-span-2">
                    <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('stock_movement_overview')}</h3>
                    {monthlyMovements.length > 0 ? (
                        <Suspense fallback={<div className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-gray-500">{t('loading_chart')}</div>}>
                            <Chart
                                options={chartOptions}
                                series={chartSeries}
                                type="bar"
                                height={280}
                            />
                        </Suspense>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                            {t('no_movement_data')}
                        </div>
                    )}
                </div>

                {/* Storage Usage */}
                {storageUsage && (
                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('storage_usage')}</h3>
                            <button
                                type="button"
                                onClick={() => setShowCleanModal(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                title={t('clean_cache_logs')}
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {t('clean')}
                            </button>
                        </div>
                        <Suspense fallback={<div className="flex h-48 items-center justify-center text-sm text-gray-400 dark:text-gray-500">{t('loading_chart')}</div>}>
                            <Chart
                                options={storageChartOptions}
                                series={[storagePercentage]}
                                type="radialBar"
                                height={220}
                            />
                        </Suspense>
                        <div className="space-y-2 px-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">{t('application')}</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{formatBytes(storageUsage.app_size)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">{t('database')}</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{formatBytes(storageUsage.db_size)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('total_used')}</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBytes(storageUsage.total_used)}</span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('capacity')}</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBytes(storageUsage.capacity)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Low Stock Alerts */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 xl:col-span-3">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('low_stock_alerts')}</h3>
                        <Link
                            href="/products?stock_status=low"
                            className="text-sm font-medium text-brand-500 hover:text-brand-600"
                        >
                            {t('view_all')}
                        </Link>
                    </div>
                    {lowStockProducts.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">{t('no_low_stock_alerts')}</p>
                    ) : (
                        <div className="space-y-3">
                            {lowStockProducts.slice(0, 5).map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{product.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="error">
                                            {product.current_stock} / {product.minimum_stock}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Movements */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('recent_stock_movements')}</h3>
                    <Link
                        href="/stock-movements"
                        className="text-sm font-medium text-brand-500 hover:text-brand-600"
                    >
                        {t('view_all')}
                    </Link>
                </div>
                {recentMovements.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">{t('no_recent_movements')}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('product')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('type')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('quantity')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('warehouse')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('date')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {recentMovements.slice(0, 5).map((movement) => (
                                    <tr key={movement.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{movement.product}</td>
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
            <ConfirmModal
                show={showCleanModal}
                onClose={() => setShowCleanModal(false)}
                onConfirm={handleCleanCache}
                title={t('clean_cache_logs')}
                message={t('clean_cache_logs_confirm')}
                confirmLabel={t('clean')}
                variant="warning"
                processing={cleanProcessing}
            />
        </AuthenticatedLayout>
    );
}
