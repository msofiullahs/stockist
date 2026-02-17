import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { useTranslation } from '@/utils/translation';

function EyeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

function EyeOffIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
    );
}

interface PasswordFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    error?: string;
    hint?: string;
    inputClass: string;
}

function PasswordField({ label, value, onChange, placeholder, error, hint, inputClass }: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} <span className="text-error-500">*</span>
            </label>
            <div className="relative">
                <input
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${inputClass} pr-10`}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute right-0 top-0 flex h-full items-center px-3 text-gray-400 dark:text-gray-500 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                    tabIndex={-1}
                >
                    {visible ? (
                        <EyeOffIcon className="h-4.5 w-4.5" />
                    ) : (
                        <EyeIcon className="h-4.5 w-4.5" />
                    )}
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
            {hint && !error && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
        </div>
    );
}

export default function PasswordChange() {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put('/profile/password', {
            onSuccess: () => reset(),
        });
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

    return (
        <AuthenticatedLayout>
            <Head title={t('change_password')} />

            <PageHeader
                title={t('change_password')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('change_password') },
                ]}
            />

            <div className="mx-auto max-w-2xl">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <PasswordField
                            label={t('current_password')}
                            value={data.current_password}
                            onChange={(val) => setData('current_password', val)}
                            placeholder={t('enter_current_password')}
                            error={errors.current_password}
                            inputClass={inputClass}
                        />

                        <PasswordField
                            label={t('new_password')}
                            value={data.password}
                            onChange={(val) => setData('password', val)}
                            placeholder={t('enter_new_password')}
                            error={errors.password}
                            hint={t('minimum_8_characters')}
                            inputClass={inputClass}
                        />

                        <PasswordField
                            label={t('confirm_new_password')}
                            value={data.password_confirmation}
                            onChange={(val) => setData('password_confirmation', val)}
                            placeholder={t('confirm_new_password')}
                            error={errors.password_confirmation}
                            inputClass={inputClass}
                        />

                        {/* Actions */}
                        <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                            >
                                {processing ? t('updating') : t('update_password')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
