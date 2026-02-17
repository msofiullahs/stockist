import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import NumericInput from '@/Components/NumericInput';
import { PageProps } from '@/types';
import { useFormatCurrency } from '@/utils/currency';
import { FormEvent, useState } from 'react';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps {
    suppliers: Array<{ id: number; name: string }>;
    products: Array<{ id: number; name: string; sku: string; cost_price: number; unit: string }>;
    orderNumber: string;
}

interface OrderItem { product_id: string; quantity: string; unit_price: string; }

export default function PurchaseOrderForm() {
    const { t } = useTranslation();
    const { suppliers, products, orderNumber } = usePage<Props>().props;
    const formatCurrency = useFormatCurrency();
    const [items, setItems] = useState<OrderItem[]>([{ product_id: '', quantity: '1', unit_price: '' }]);

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '', order_number: orderNumber, notes: '',
        order_date: new Date().toISOString().split('T')[0], expected_date: '',
        items: items,
    });

    const addItem = () => {
        const newItems = [...items, { product_id: '', quantity: '1', unit_price: '' }];
        setItems(newItems);
        setData('items', newItems);
    };

    const removeItem = (idx: number) => {
        const newItems = items.filter((_, i) => i !== idx);
        setItems(newItems);
        setData('items', newItems);
    };

    const updateItem = (idx: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items];
        (newItems[idx] as any)[field] = value;
        if (field === 'product_id') {
            const product = products.find(p => p.id === Number(value));
            if (product) newItems[idx].unit_price = String(product.cost_price);
        }
        setItems(newItems);
        setData('items', newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);

    const submit = (e: FormEvent) => { e.preventDefault(); post('/purchase-orders'); };
    const inputClass = "w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

    return (
        <AuthenticatedLayout>
            <Head title={t('new_purchase_order')} />
            <PageHeader title={t('new_purchase_order')} breadcrumbs={[{ label: t('dashboard'), href: '/dashboard' }, { label: t('purchase_orders'), href: '/purchase-orders' }, { label: t('create') }]} />
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('order_number')} *</label>
                            <input type="text" value={data.order_number} onChange={e => setData('order_number', e.target.value)} className={inputClass} />
                            {errors.order_number && <p className="mt-1 text-xs text-error-500">{errors.order_number}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('supplier')} *</label>
                            <select value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} className={inputClass}>
                                <option value="">{t('select_supplier')}</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {errors.supplier_id && <p className="mt-1 text-xs text-error-500">{errors.supplier_id}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('order_date')} *</label>
                            <input type="date" value={data.order_date} onChange={e => setData('order_date', e.target.value)} className={inputClass} />
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('order_items')}</h3>
                            <button type="button" onClick={addItem} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">+ {t('add_item')}</button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3">
                                    <div className="flex-1">
                                        <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} className={inputClass}>
                                            <option value="">{t('select_product')}</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <NumericInput value={item.quantity} onChange={val => updateItem(idx, 'quantity', val)} className={inputClass} placeholder={t('quantity')} />
                                    </div>
                                    <div className="w-32">
                                        <NumericInput decimal value={item.unit_price} onChange={val => updateItem(idx, 'unit_price', val)} className={inputClass} placeholder={t('price')} />
                                    </div>
                                    <div className="w-28 pt-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}</div>
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(idx)} className="mt-2 rounded p-1 text-gray-400 dark:text-gray-500 hover:text-error-500">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex justify-end border-t border-gray-200 dark:border-gray-700 pt-3">
                            <p className="text-base font-bold text-gray-900 dark:text-gray-100">{t('total')}: {formatCurrency(totalAmount)}</p>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('notes')}</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className={inputClass} />
                    </div>

                    <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-5">
                        <button type="submit" disabled={processing} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">{processing ? t('creating') : t('create_order')}</button>
                        <Link href="/purchase-orders" className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('cancel')}</Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
