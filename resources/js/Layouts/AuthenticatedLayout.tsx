import { PropsWithChildren, useState, useRef, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/translation';

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const { auth, flash, settings } = usePage<PageProps>().props;
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync dark mode class
    useEffect(() => {
        document.documentElement.classList.toggle('dark', settings?.theme === 'dark');
    }, [settings?.theme]);

    // Sync app name for browser title
    useEffect(() => {
        if (settings?.app_name) {
            (document as any).__stockistAppName = settings.app_name;
        }
    }, [settings?.app_name]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setDropdownOpen(false);
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    const handleLogout = () => {
        router.post('/logout');
    };

    const isAdmin = auth.user?.roles?.includes('admin');

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar
                user={auth.user}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Content Area */}
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <header className="sticky top-0 z-40 flex w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-grow items-center justify-between px-4 py-2 md:px-6">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex-1" />

                        {/* User menu with dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{auth.user?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{auth.user?.roles?.[0] ?? 'User'}</p>
                                </div>
                                {auth.user?.photo ? (
                                    <img
                                        src={auth.user.photo}
                                        alt={auth.user.name}
                                        className="h-9 w-9 rounded-full border border-gray-200 object-cover dark:border-gray-600"
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                                        {auth.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <svg className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                                    {/* User info header */}
                                    <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{auth.user?.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{auth.user?.email}</p>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-1">
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {t('edit_profile')}
                                        </Link>
                                        <Link
                                            href="/profile/password"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            {t('change_password')}
                                        </Link>
                                        {isAdmin && (
                                            <Link
                                                href="/settings/general"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {t('settings')}
                                            </Link>
                                        )}
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-100 py-1 dark:border-gray-700">
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {t('logout')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {flash?.success && <FlashMessage type="success" message={flash.success} />}
                {flash?.error && <FlashMessage type="error" message={flash.error} />}

                {/* Main Content */}
                <main className="mx-auto w-full max-w-screen-2xl flex-1 p-4 md:p-6">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-200 px-4 py-4 text-center text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500">
                    &copy; {new Date().getFullYear()} Muhammad Sofiullah S.
                </footer>
            </div>
        </div>
    );
}
