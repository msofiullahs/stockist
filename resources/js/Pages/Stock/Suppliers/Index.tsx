import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable, { Column } from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import Badge from '@/Components/Badge';
import ConfirmModal from '@/Components/ConfirmModal';
import ImportModal from '@/Components/ImportModal';
import { PageProps, Supplier, PaginatedData } from '@/types';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps {
    suppliers: PaginatedData<Supplier>;
    filters: { search?: string };
}

export default function SupplierIndex({ suppliers, filters }: Props) {
    const { t } = useTranslation();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [showImport, setShowImport] = useState(false);

    const handleDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/suppliers/${deleteId}`, {
            onFinish: () => { setDeleting(false); setDeleteId(null); },
        });
    };

    const columns: Column<Supplier>[] = [
        {
            label: t('supplier'),
            render: (supplier) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{supplier.name}</p>
                    {supplier.contact_person && <p className="text-xs text-gray-500 dark:text-gray-400">{supplier.contact_person}</p>}
                </div>
            ),
        },
        { label: t('email'), render: (supplier) => <span className="text-gray-600 dark:text-gray-400">{supplier.email || '-'}</span> },
        { label: t('phone'), render: (supplier) => <span className="text-gray-600 dark:text-gray-400">{supplier.phone || '-'}</span> },
        { label: t('city'), render: (supplier) => <span className="text-gray-600 dark:text-gray-400">{supplier.city || '-'}</span> },
        { label: t('products'), render: (supplier) => <span className="text-gray-600 dark:text-gray-400">{supplier.products_count ?? 0}</span> },
        { label: t('status'), render: (supplier) => <Badge variant={supplier.is_active ? 'success' : 'gray'}>{supplier.is_active ? t('active') : t('inactive')}</Badge> },
        {
            label: t('actions'),
            render: (supplier) => (
                <div className="flex items-center gap-2">
                    <Link href={`/suppliers/${supplier.id}/edit`} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand-500" title={t('edit')}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </Link>
                    <button onClick={() => setDeleteId(supplier.id)} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-error-500" title={t('delete')}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            ),
            className: 'w-24',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('suppliers')} />
            <PageHeader title={t('suppliers')} breadcrumbs={[{ label: t('dashboard'), href: '/dashboard' }, { label: t('suppliers') }]}
                actions={
                    <>
                        <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" /></svg>
                            {t('import')}
                        </button>
                        <Link href="/suppliers/create" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            {t('add_supplier')}
                        </Link>
                    </>
                }
            />
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="p-4">
                    <SearchFilter searchValue={filters.search || ''} searchPlaceholder={t('search_suppliers')} url="/suppliers" filterValues={filters} />
                </div>
                <DataTable columns={columns} data={suppliers.data} emptyMessage={t('no_data')} />
                <Pagination links={suppliers.links} currentPage={suppliers.current_page} lastPage={suppliers.last_page} />
            </div>

            <ConfirmModal
                show={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title={t('delete_supplier')}
                message={t('confirm_delete_supplier')}
                confirmLabel={t('delete')}
                processing={deleting}
            />

            <ImportModal
                show={showImport}
                onClose={() => setShowImport(false)}
                importUrl="/import/suppliers"
                templateUrl="/import/suppliers/template"
                title={t('import_suppliers')}
            />
        </AuthenticatedLayout>
    );
}
