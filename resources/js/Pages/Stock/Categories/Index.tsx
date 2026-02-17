import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable, { Column } from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import ConfirmModal from '@/Components/ConfirmModal';
import ImportModal from '@/Components/ImportModal';
import { PageProps, Category, PaginatedData } from '@/types';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps {
    categories: PaginatedData<Category>;
    filters: {
        search?: string;
    };
}

export default function CategoryIndex({ categories, filters }: Props) {
    const { t } = useTranslation();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [showImport, setShowImport] = useState(false);

    const handleDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/categories/${deleteId}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: Column<Category>[] = [
        {
            label: t('name'),
            render: (category) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
            ),
        },
        {
            label: t('slug'),
            key: 'slug',
        },
        {
            label: t('parent'),
            render: (category) => (
                <span className="text-gray-600 dark:text-gray-400">{category.parent?.name || '-'}</span>
            ),
        },
        {
            label: t('products'),
            render: (category) => (
                <span className="text-gray-600 dark:text-gray-400">{category.products_count ?? 0}</span>
            ),
        },
        {
            label: t('description'),
            render: (category) => (
                <span className="max-w-xs truncate text-gray-500 dark:text-gray-400">
                    {category.description || '-'}
                </span>
            ),
        },
        {
            label: t('actions'),
            render: (category) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/categories/${category.id}/edit`}
                        className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand-500"
                        title={t('edit')}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </Link>
                    <button
                        onClick={() => setDeleteId(category.id)}
                        className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-error-500"
                        title={t('delete')}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
            className: 'w-24',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('categories')} />

            <PageHeader
                title={t('categories')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('categories') },
                ]}
                actions={
                    <>
                        <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" /></svg>
                            {t('import')}
                        </button>
                        <Link
                            href="/categories/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('add_category')}
                        </Link>
                    </>
                }
            />

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="p-4">
                    <SearchFilter
                        searchValue={filters.search || ''}
                        searchPlaceholder={t('search_categories')}
                        url="/categories"
                        filterValues={filters}
                    />
                </div>

                <DataTable columns={columns} data={categories.data} emptyMessage={t('no_data')} />

                <Pagination
                    links={categories.links}
                    currentPage={categories.current_page}
                    lastPage={categories.last_page}
                />
            </div>

            <ConfirmModal
                show={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title={t('delete_category')}
                message={t('confirm_delete_category')}
                confirmLabel={t('delete')}
                processing={deleting}
            />

            <ImportModal
                show={showImport}
                onClose={() => setShowImport(false)}
                importUrl="/import/categories"
                templateUrl="/import/categories/template"
                title={t('import_categories')}
            />
        </AuthenticatedLayout>
    );
}
