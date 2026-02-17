import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { PageProps } from '@/types';
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

export default function Login() {
    const { t } = useTranslation();
    const { settings } = usePage<PageProps>().props;
    const appName = settings?.app_name || 'Stockist';
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    const fillDemo = (role: 'admin' | 'staff') => {
        const accounts = {
            admin: { email: 'admin@stockist.test', password: 'password' },
            staff: { email: 'staff@stockist.test', password: 'password' },
        };
        setData({ ...data, ...accounts[role] });
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

    return (
        <>
            <Head title={t('login')} />

            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{appName}</h1>
                        <p className="mt-1 text-sm text-gray-500">{t('sign_in_subtitle')}</p>
                    </div>

                    {/* Login Card */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('email')}
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={inputClass}
                                    placeholder={t('enter_email')}
                                    autoFocus
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-error-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('password')}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`${inputClass} pr-10`}
                                        placeholder={t('enter_password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 flex h-full items-center px-3 text-gray-400 transition-colors hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon className="h-4.5 w-4.5" />
                                        ) : (
                                            <EyeIcon className="h-4.5 w-4.5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-error-500">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                    {t('remember_me')}
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                            >
                                {processing ? t('signing_in') : t('sign_in')}
                            </button>
                        </form>

                        {/* Demo Accounts */}
                        <div className="mt-6 border-t border-gray-200 pt-5">
                            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-gray-400">
                                {t('demo_accounts')}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => fillDemo('admin')}
                                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    {t('admin')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillDemo('staff')}
                                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    {t('staff')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
