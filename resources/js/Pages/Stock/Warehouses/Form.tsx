import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Warehouse } from '@/types';
import { useTranslation } from '@/utils/translation';

interface Props {
    warehouse?: Warehouse;
}

export default function WarehouseForm({ warehouse }: Props) {
    const { t } = useTranslation();
    const isEditing = !!warehouse;

    const { data, setData, post, put, processing, errors } = useForm({
        name: warehouse?.name || '',
        location: warehouse?.location || '',
        address: warehouse?.address || '',
        is_active: warehouse?.is_active ?? true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/warehouses/${warehouse!.id}`);
        } else {
            post('/warehouses');
        }
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

    return (
        <AuthenticatedLayout>
            <Head title={isEditing ? t('edit_warehouse') : t('add_warehouse')} />

            <PageHeader
                title={isEditing ? t('edit_warehouse') : t('add_warehouse')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('warehouses'), href: '/warehouses' },
                    { label: isEditing ? t('edit') : t('create') },
                ]}
            />

            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <form onSubmit={submit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('name')} <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputClass}
                            placeholder={t('enter_warehouse_name')}
                        />
                        {errors.name && <p className="mt-1 text-xs text-error-500">{errors.name}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('location')}</label>
                        <input
                            type="text"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            className={inputClass}
                            placeholder={t('enter_location')}
                        />
                        {errors.location && <p className="mt-1 text-xs text-error-500">{errors.location}</p>}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('address')}</label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className={inputClass}
                            rows={3}
                            placeholder={t('enter_address')}
                        />
                        {errors.address && <p className="mt-1 text-xs text-error-500">{errors.address}</p>}
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500/20"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">{t('active')}</label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                        >
                            {processing ? `${t('save')}...` : isEditing ? t('edit_warehouse') : t('add_warehouse')}
                        </button>
                        <Link
                            href="/warehouses"
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
