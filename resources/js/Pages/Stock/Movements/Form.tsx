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

export default function MovementForm({ products, warehouses }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        type: 'in' as 'in' | 'out',
        product_id: '',
        warehouse_id: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/stock-movements');
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

    return (
        <AuthenticatedLayout>
            <Head title={t('record_movement')} />

            <PageHeader
                title={t('record_movement')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('stock_movement'), href: '/stock-movements' },
                    { label: t('record') },
                ]}
            />

            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <form onSubmit={submit} className="space-y-6">
                    {/* Type Toggle */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('movement_type')} <span className="text-error-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setData('type', 'in')}
                                className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                                    data.type === 'in'
                                        ? 'border-success-500 bg-success-500/10 text-success-500'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
                                    </svg>
                                    {t('stock_in')}
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('type', 'out')}
                                className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                                    data.type === 'out'
                                        ? 'border-error-500 bg-error-500/10 text-error-500'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                    {t('stock_out')}
                                </div>
                            </button>
                        </div>
                        {errors.type && <p className="mt-1 text-xs text-error-500">{errors.type}</p>}
                    </div>

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
                                    {p.name} ({t('sku')}: {p.sku}) - {t('stock')}: {p.current_stock}
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

                    {/* Quantity */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('quantity')} <span className="text-error-500">*</span>
                        </label>
                        <NumericInput
                            value={data.quantity}
                            onChange={(val) => setData('quantity', val)}
                            className={inputClass}
                            placeholder={t('enter_quantity')}
                        />
                        {errors.quantity && <p className="mt-1 text-xs text-error-500">{errors.quantity}</p>}
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

                    {/* Notes */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('notes')}</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className={inputClass}
                            rows={3}
                            placeholder={t('optional_notes')}
                        />
                        {errors.notes && <p className="mt-1 text-xs text-error-500">{errors.notes}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                        >
                            {processing ? t('saving') : t('record_movement')}
                        </button>
                        <Link
                            href="/stock-movements"
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
