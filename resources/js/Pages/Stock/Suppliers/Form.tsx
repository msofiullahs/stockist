import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Supplier } from '@/types';
import { useTranslation } from '@/utils/translation';

interface Props {
    supplier?: Supplier;
}

export default function SupplierForm({ supplier }: Props) {
    const { t } = useTranslation();
    const isEditing = !!supplier;

    const { data, setData, post, put, processing, errors } = useForm({
        name: supplier?.name || '',
        email: supplier?.email || '',
        phone: supplier?.phone || '',
        address: supplier?.address || '',
        city: supplier?.city || '',
        country: supplier?.country || '',
        contact_person: supplier?.contact_person || '',
        is_active: supplier?.is_active ?? true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/suppliers/${supplier!.id}`);
        } else {
            post('/suppliers');
        }
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

    return (
        <AuthenticatedLayout>
            <Head title={isEditing ? t('edit_supplier') : t('add_supplier')} />

            <PageHeader
                title={isEditing ? t('edit_supplier') : t('add_supplier')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('suppliers'), href: '/suppliers' },
                    { label: isEditing ? t('edit') : t('create') },
                ]}
            />

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                                placeholder={t('enter_supplier_name')}
                            />
                            {errors.name && <p className="mt-1 text-xs text-error-500">{errors.name}</p>}
                        </div>

                        {/* Contact Person */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('contact_person')}</label>
                            <input
                                type="text"
                                value={data.contact_person}
                                onChange={(e) => setData('contact_person', e.target.value)}
                                className={inputClass}
                                placeholder={t('enter_contact_person')}
                            />
                            {errors.contact_person && <p className="mt-1 text-xs text-error-500">{errors.contact_person}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('email')}</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={inputClass}
                                placeholder={t('enter_email')}
                            />
                            {errors.email && <p className="mt-1 text-xs text-error-500">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phone')}</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className={inputClass}
                                placeholder={t('enter_phone')}
                            />
                            {errors.phone && <p className="mt-1 text-xs text-error-500">{errors.phone}</p>}
                        </div>

                        {/* City */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('city')}</label>
                            <input
                                type="text"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                className={inputClass}
                                placeholder={t('enter_city')}
                            />
                            {errors.city && <p className="mt-1 text-xs text-error-500">{errors.city}</p>}
                        </div>

                        {/* Country */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('country')}</label>
                            <input
                                type="text"
                                value={data.country}
                                onChange={(e) => setData('country', e.target.value)}
                                className={inputClass}
                                placeholder={t('enter_country')}
                            />
                            {errors.country && <p className="mt-1 text-xs text-error-500">{errors.country}</p>}
                        </div>
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
                            {processing ? `${t('save')}...` : isEditing ? t('edit_supplier') : t('add_supplier')}
                        </button>
                        <Link
                            href="/suppliers"
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
