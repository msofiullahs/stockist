import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { PageProps } from '@/types';
import { FormEvent } from 'react';
import { useTranslation } from '@/utils/translation';

interface Props extends PageProps {
    user?: { id: number; name: string; email: string; role: string };
    roles: string[];
}

export default function UserForm() {
    const { t } = useTranslation();
    const { user, roles } = usePage<Props>().props;
    const isEdit = !!user;
    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '', email: user?.email || '',
        password: '', password_confirmation: '', role: user?.role || 'staff',
    });

    const submit = (e: FormEvent) => { e.preventDefault(); isEdit ? put(`/users/${user!.id}`) : post('/users'); };
    const inputClass = "w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? t('edit_user') : t('add_user')} />
            <PageHeader title={isEdit ? t('edit_user') : t('add_user')} breadcrumbs={[{ label: t('dashboard'), href: '/dashboard' }, { label: t('users'), href: '/users' }, { label: isEdit ? t('edit') : t('add_user') }]} />
            <div className="max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('name')} *</label><input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputClass} />{errors.name && <p className="mt-1 text-xs text-error-500">{errors.name}</p>}</div>
                        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('email')} *</label><input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputClass} />{errors.email && <p className="mt-1 text-xs text-error-500">{errors.email}</p>}</div>
                        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{isEdit ? t('new_password') : t('password')} {!isEdit && '*'}</label><input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className={inputClass} placeholder={isEdit ? t('leave_blank_to_keep_current') : ''} />{errors.password && <p className="mt-1 text-xs text-error-500">{errors.password}</p>}</div>
                        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('confirm_password')}</label><input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('role')} *</label>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {roles.map((r: string) => (
                                <button key={r} type="button" onClick={() => setData('role', r)}
                                    className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold capitalize transition-colors ${data.role === r ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                        {errors.role && <p className="mt-1 text-xs text-error-500">{errors.role}</p>}
                    </div>
                    <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-5">
                        <button type="submit" disabled={processing} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">{processing ? t('saving') : isEdit ? t('update_user') : t('create_user')}</button>
                        <Link href="/users" className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('cancel')}</Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
