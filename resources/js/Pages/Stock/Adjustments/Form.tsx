import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import NumericInput from '@/Components/NumericInput';
import { Product, Warehouse } from '@/types';
import { useTranslation } from '@/utils/translation';

interface Props {
    products: Product[];
    warehouses: Warehouse[];
}

export default function AdjustmentForm({ products, warehouses }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        warehouse_id: '',
        adjustment_type: 'increase',
        quantity_after: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/stock-adjustments');
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

    return (
        <AuthenticatedLayout>
            <Head title={t('new_adjustment')} />

            <PageHeader
                title={t('new_adjustment')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('adjustments'), href: '/stock-adjustments' },
                    { label: t('create') },
                ]}
            />

            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <form onSubmit={submit} className="space-y-6">
                    {/* Product */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('product')} <span className="text-error-500">*</span>
                        </label>
                        <select
                            value={data.product_id}
                            onChange={(e) => setData('product_id', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">{t('select_product')}</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({t('sku')}: {p.sku}) - {t('current')}: {p.current_stock}
                                </option>
                            ))}
                        </select>
                        {errors.product_id && <p className="mt-1 text-xs text-error-500">{errors.product_id}</p>}
                    </div>

                    {/* Warehouse */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('warehouse')} <span className="text-error-500">*</span>
                        </label>
                        <select
                            value={data.warehouse_id}
                            onChange={(e) => setData('warehouse_id', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">{t('select_warehouse')}</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                        {errors.warehouse_id && <p className="mt-1 text-xs text-error-500">{errors.warehouse_id}</p>}
                    </div>

                    {/* Adjustment Type */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('adjustment_type')} <span className="text-error-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            {['increase', 'decrease', 'damage', 'expired', 'correction'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setData('adjustment_type', type)}
                                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-sm font-medium capitalize transition-colors ${
                                        data.adjustment_type === type
                                            ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        {errors.adjustment_type && <p className="mt-1 text-xs text-error-500">{errors.adjustment_type}</p>}
                    </div>

                    {/* New Quantity */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('new_quantity_after_adjustment')} <span className="text-error-500">*</span>
                        </label>
                        <NumericInput
                            value={data.quantity_after}
                            onChange={(val) => setData('quantity_after', val)}
                            className={inputClass}
                            placeholder={t('enter_new_quantity')}
                        />
                        {errors.quantity_after && <p className="mt-1 text-xs text-error-500">{errors.quantity_after}</p>}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('date')} <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            className={inputClass}
                        />
                        {errors.date && <p className="mt-1 text-xs text-error-500">{errors.date}</p>}
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('reason')} <span className="text-error-500">*</span>
                        </label>
                        <textarea
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            className={inputClass}
                            rows={3}
                            placeholder={t('explain_reason_for_adjustment')}
                        />
                        {errors.reason && <p className="mt-1 text-xs text-error-500">{errors.reason}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                        >
                            {processing ? t('saving') : t('submit_adjustment')}
                        </button>
                        <Link
                            href="/stock-adjustments"
                            className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            {t('cancel')}
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
