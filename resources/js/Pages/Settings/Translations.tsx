import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { useTranslation } from '@/utils/translation';

interface Language {
    code: string;
    name: string;
}

interface TranslationRow {
    [langCode: string]: string;
}

interface Props {
    languages: Language[];
    translationData: Record<string, TranslationRow>;
}

const PER_PAGE = 20;

export default function Translations({ languages, translationData: initialTranslations }: Props) {
    const { t } = useTranslation();
    const [translations, setTranslations] = useState<Record<string, TranslationRow>>(initialTranslations);
    const [search, setSearch] = useState('');
    const [newKey, setNewKey] = useState('');
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showAddRow, setShowAddRow] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const allKeys = useMemo(() => {
        const keys = Object.keys(translations);
        if (!search.trim()) return keys;
        const q = search.toLowerCase();
        return keys.filter(key => {
            if (key.toLowerCase().includes(q)) return true;
            const row = translations[key];
            return Object.values(row).some(val => val.toLowerCase().includes(q));
        });
    }, [translations, search]);

    const totalPages = Math.max(1, Math.ceil(allKeys.length / PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedKeys = useMemo(() => {
        const start = (safePage - 1) * PER_PAGE;
        return allKeys.slice(start, start + PER_PAGE);
    }, [allKeys, safePage]);

    const startIndex = (safePage - 1) * PER_PAGE + 1;
    const endIndex = Math.min(safePage * PER_PAGE, allKeys.length);

    // Reset to page 1 when search changes
    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleChange = useCallback((key: string, langCode: string, value: string) => {
        setTranslations(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [langCode]: value,
            },
        }));
        setHasChanges(true);
    }, []);

    const handleAddKey = () => {
        const trimmed = newKey.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (!trimmed || translations[trimmed]) return;

        const row: TranslationRow = { en: '' };
        languages.forEach(l => { row[l.code] = ''; });

        setTranslations(prev => ({ ...prev, [trimmed]: row }));
        setNewKey('');
        setShowAddRow(false);
        setHasChanges(true);
        // Go to last page to see the new key
        const newTotal = Math.ceil((allKeys.length + 1) / PER_PAGE);
        setCurrentPage(newTotal);
    };

    const handleDeleteKey = (key: string) => {
        setTranslations(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        setHasChanges(true);
    };

    const handleSave = () => {
        setSaving(true);
        router.put('/settings/translations', { translations }, {
            onFinish: () => {
                setSaving(false);
                setHasChanges(false);
            },
        });
    };

    const inputClass =
        'w-full border-0 bg-transparent px-3 py-2 text-sm outline-none focus:bg-brand-50/50 focus:ring-0 dark:focus:bg-brand-500/5 dark:text-gray-100';

    const pageNumbers = useMemo(() => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (safePage > 3) pages.push('...');
            const start = Math.max(2, safePage - 1);
            const end = Math.min(totalPages - 1, safePage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (safePage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    }, [totalPages, safePage]);

    return (
        <AuthenticatedLayout>
            <Head title={t('translations')} />

            <PageHeader
                title={t('translations')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('settings') },
                    { label: t('translations') },
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        {hasChanges && (
                            <span className="text-xs font-medium text-warning-500">{t('unsaved_changes')}</span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    {t('saving')}
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {t('save_translations')}
                                </>
                            )}
                        </button>
                    </div>
                }
            />

            {/* Toolbar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-sm">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder={t('search_translations')}
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {allKeys.length} {allKeys.length === 1 ? t('key') : t('keys')}
                    </span>
                    <button
                        onClick={() => setShowAddRow(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('add_key')}
                    </button>
                </div>
            </div>

            {languages.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                    <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('no_languages_configured')}</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {t('add_languages_in')}{' '}
                        <a href="/settings/general" className="font-medium text-brand-500 hover:text-brand-600">
                            {t('general_settings')}
                        </a>{' '}
                        {t('to_start_translating')}
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                                    <th className="w-56 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        {t('translation_key')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        {t('english')}
                                    </th>
                                    {languages.map((lang) => (
                                        <th key={lang.code} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            {lang.name}
                                            <span className="ml-1 font-mono text-[10px] font-normal text-gray-400 dark:text-gray-500">({lang.code})</span>
                                        </th>
                                    ))}
                                    <th className="w-12 px-2 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {/* Add New Key Row */}
                                {showAddRow && (
                                    <tr className="bg-brand-50/30 dark:bg-brand-500/5">
                                        <td className="px-3 py-2" colSpan={2 + languages.length + 1}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={newKey}
                                                    onChange={(e) => setNewKey(e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))}
                                                    placeholder="enter_new_key"
                                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddKey();
                                                        if (e.key === 'Escape') { setShowAddRow(false); setNewKey(''); }
                                                    }}
                                                />
                                                <button
                                                    onClick={handleAddKey}
                                                    disabled={!newKey.trim() || !!translations[newKey.trim()]}
                                                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                                                >
                                                    {t('add')}
                                                </button>
                                                <button
                                                    onClick={() => { setShowAddRow(false); setNewKey(''); }}
                                                    className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    {t('cancel')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {paginatedKeys.map((key) => (
                                    <tr key={key} className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                        <td className="px-4 py-0.5">
                                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{key}</span>
                                        </td>
                                        <td className="border-l border-gray-100 px-0 py-0 dark:border-gray-700/50">
                                            <input
                                                type="text"
                                                value={translations[key]?.en || ''}
                                                onChange={(e) => handleChange(key, 'en', e.target.value)}
                                                className={inputClass}
                                                placeholder={t('english_translation')}
                                            />
                                        </td>
                                        {languages.map((lang) => (
                                            <td key={lang.code} className="border-l border-gray-100 px-0 py-0 dark:border-gray-700/50">
                                                <input
                                                    type="text"
                                                    value={translations[key]?.[lang.code] || ''}
                                                    onChange={(e) => handleChange(key, lang.code, e.target.value)}
                                                    className={`${inputClass} ${!translations[key]?.[lang.code] ? 'text-gray-300 dark:text-gray-600' : ''}`}
                                                    placeholder={translations[key]?.en || t('translation')}
                                                />
                                            </td>
                                        ))}
                                        <td className="px-2 py-0.5 text-center">
                                            <button
                                                onClick={() => handleDeleteKey(key)}
                                                className="rounded p-1 text-gray-300 opacity-0 transition-all hover:text-error-500 group-hover:opacity-100 dark:text-gray-600 dark:hover:text-error-400"
                                                title={t('delete_key')}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {allKeys.length === 0 && !showAddRow && (
                                    <tr>
                                        <td colSpan={2 + languages.length + 1} className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                                            {search ? t('no_keys_match') : t('no_translation_keys')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('showing')} <span className="font-medium">{startIndex}</span> - <span className="font-medium">{endIndex}</span> {t('of')}{' '}
                                <span className="font-medium">{allKeys.length}</span> {t('keys')}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                {pageNumbers.map((page, i) =>
                                    page === '...' ? (
                                        <span key={`dots-${i}`} className="px-2 text-sm text-gray-400 dark:text-gray-500">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                safePage === page
                                                    ? 'bg-brand-500 text-white'
                                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AuthenticatedLayout>
    );
}
