import { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import Badge from '@/Components/Badge';
import ConfirmModal from '@/Components/ConfirmModal';
import { PageProps, PaginatedData } from '@/types';
import { useTranslation } from '@/utils/translation';

interface UserRow { id: number; name: string; email: string; roles: string[]; created_at: string; }
interface Props extends PageProps {
    users: PaginatedData<UserRow>;
    roles: string[];
    filters: { search?: string; role?: string };
}

const roleColors: Record<string, string> = { admin: 'error', manager: 'warning', staff: 'info', viewer: 'gray' };

export default function UsersIndex() {
    const { t } = useTranslation();
    const { users, roles, filters } = usePage<Props>().props;
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/users/${deleteId}`, {
            onFinish: () => { setDeleting(false); setDeleteId(null); },
        });
    };

    const columns = [
        { key: 'name', label: t('name'), render: (u: UserRow) => <span className="font-medium text-gray-900 dark:text-gray-100">{u.name}</span> },
        { key: 'email', label: t('email') },
        { key: 'roles', label: t('role'), render: (u: UserRow) => u.roles.map((r: string) => <Badge key={r} variant={roleColors[r] || 'gray'}>{r}</Badge>) },
        { key: 'created_at', label: t('created_at') },
        {
            key: 'actions', label: '',
            render: (u: UserRow) => (
                <div className="flex items-center gap-1">
                    <Link href={`/users/${u.id}/edit`} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Link>
                    <button onClick={() => setDeleteId(u.id)} className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-error-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('user_management')} />
            <PageHeader title={t('user_management')} breadcrumbs={[{ label: t('dashboard'), href: '/dashboard' }, { label: t('users') }]}
                actions={<Link href="/users/create" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>{t('add_user')}</Link>}
            />
            <SearchFilter searchValue={filters.search} searchPlaceholder={t('search_users')} routeName="/users"
                filters={[{ name: 'role', label: t('all_roles'), value: filters.role, options: roles.map((r: string) => ({ label: r.charAt(0).toUpperCase() + r.slice(1), value: r })) }]}
            />
            <DataTable columns={columns} data={users.data} />
            <Pagination links={users.links} currentPage={users.current_page} lastPage={users.last_page} />

            <ConfirmModal
                show={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title={t('delete_user')}
                message={t('confirm_delete_user')}
                confirmLabel={t('delete')}
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}
