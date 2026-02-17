import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Category } from '@/types';
import { useTranslation } from '@/utils/translation';

interface Props {
    category?: Category;
    categories: Category[];
}

export default function CategoryForm({ category, categories }: Props) {
    const { t } = useTranslation();
    const isEditing = !!category;

    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name || '',
        description: category?.description || '',
        parent_id: category?.parent_id || '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/categories/${category!.id}`);
        } else {
            post('/categories');
        }
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

    // Exclude current category from parent options
    const parentOptions = categories.filter((c) => c.id !== category?.id);

    return (
        <AuthenticatedLayout>
            <Head title={isEditing ? t('edit_category') : t('new_category')} />

            <PageHeader
                title={isEditing ? t('edit_category') : t('new_category')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('categories'), href: '/categories' },
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
                            placeholder={t('enter_category_name')}
                        />
                        {errors.name && <p className="mt-1 text-xs text-error-500">{errors.name}</p>}
                    </div>

                    {/* Parent Category */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('parent')} {t('category')}</label>
                        <select
                            value={data.parent_id}
                            onChange={(e) => setData('parent_id', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">{t('none_top_level')}</option>
                            {parentOptions.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.parent_id && <p className="mt-1 text-xs text-error-500">{errors.parent_id}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={inputClass}
                            rows={3}
                            placeholder={t('enter_description')}
                        />
                        {errors.description && <p className="mt-1 text-xs text-error-500">{errors.description}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                        >
                            {processing ? `${t('save')}...` : isEditing ? t('edit_category') : t('new_category')}
                        </button>
                        <Link
                            href="/categories"
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
