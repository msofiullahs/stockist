import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { useTranslation } from '@/utils/translation';

interface Language {
    code: string;
    name: string;
}

interface Props {
    settings: Record<string, string>;
}

const currencyPresets = [
    { label: 'US Dollar', currency: 'USD', symbol: '$' },
    { label: 'Euro', currency: 'EUR', symbol: '\u20AC' },
    { label: 'British Pound', currency: 'GBP', symbol: '\u00A3' },
    { label: 'Japanese Yen', currency: 'JPY', symbol: '\u00A5' },
    { label: 'Indonesian Rupiah', currency: 'IDR', symbol: 'Rp' },
    { label: 'Chinese Yuan', currency: 'CNY', symbol: '\u00A5' },
    { label: 'Korean Won', currency: 'KRW', symbol: '\u20A9' },
    { label: 'Indian Rupee', currency: 'INR', symbol: '\u20B9' },
    { label: 'Thai Baht', currency: 'THB', symbol: '\u0E3F' },
    { label: 'Malaysian Ringgit', currency: 'MYR', symbol: 'RM' },
    { label: 'Australian Dollar', currency: 'AUD', symbol: 'A$' },
    { label: 'Canadian Dollar', currency: 'CAD', symbol: 'C$' },
    { label: 'Swiss Franc', currency: 'CHF', symbol: 'CHF' },
    { label: 'Brazilian Real', currency: 'BRL', symbol: 'R$' },
];

const commonLanguages = [
    { code: 'id', name: 'Indonesian' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'ms', name: 'Malay' },
    { code: 'ru', name: 'Russian' },
    { code: 'tr', name: 'Turkish' },
    { code: 'pl', name: 'Polish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
];

export default function SettingsGeneral({ settings }: Props) {
    const { t } = useTranslation();
    const existingLanguages: Language[] = (() => {
        try {
            return JSON.parse(settings.languages || '[]');
        } catch {
            return [];
        }
    })();

    const [languages, setLanguages] = useState<Language[]>(existingLanguages);
    const [newLangCode, setNewLangCode] = useState('');
    const [newLangName, setNewLangName] = useState('');

    const { data, setData, put, processing, errors } = useForm({
        app_name: settings.app_name || 'Stockist',
        currency: settings.currency || 'USD',
        currency_symbol: settings.currency_symbol || '$',
        theme: settings.theme || 'light',
        languages: JSON.stringify(existingLanguages),
        locale: settings.locale || 'en',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put('/settings/general');
    };

    const handlePresetChange = (currency: string) => {
        const preset = currencyPresets.find(p => p.currency === currency);
        if (preset) {
            setData(prev => ({ ...prev, currency: preset.currency, currency_symbol: preset.symbol }));
        }
    };

    const handleThemeChange = (theme: string) => {
        setData('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    };

    const handleAddLanguage = () => {
        if (!newLangCode.trim() || !newLangName.trim()) return;
        if (languages.some(l => l.code === newLangCode.trim().toLowerCase())) return;

        const updated = [...languages, { code: newLangCode.trim().toLowerCase(), name: newLangName.trim() }];
        setLanguages(updated);
        setData('languages', JSON.stringify(updated));
        setNewLangCode('');
        setNewLangName('');
    };

    const handleSelectLanguage = (code: string) => {
        const preset = commonLanguages.find(l => l.code === code);
        if (preset) {
            setNewLangCode(preset.code);
            setNewLangName(preset.name);
        }
    };

    const handleRemoveLanguage = (code: string) => {
        const updated = languages.filter(l => l.code !== code);
        setLanguages(updated);
        setData(prev => ({
            ...prev,
            languages: JSON.stringify(updated),
            // Reset locale to English if the removed language was the active locale
            locale: prev.locale === code ? 'en' : prev.locale,
        }));
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';

    return (
        <AuthenticatedLayout>
            <Head title={t('general_settings')} />

            <PageHeader
                title={t('general_settings')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('settings') },
                    { label: t('general') },
                ]}
            />

            <div className="mx-auto max-w-2xl">
                <form onSubmit={submit} className="space-y-6">
                    {/* App Name */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">{t('app_name')}</h3>
                        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{t('app_name_description')}</p>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('app_name')}</label>
                            <input
                                type="text"
                                value={data.app_name}
                                onChange={(e) => setData('app_name', e.target.value)}
                                className={inputClass}
                                maxLength={50}
                                placeholder="Stockist"
                            />
                            {errors.app_name && <p className="mt-1 text-xs text-error-500">{errors.app_name}</p>}
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('app_name_help')}</p>
                        </div>
                    </div>

                    {/* Currency Settings */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">{t('currency')}</h3>
                        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{t('currency_description')}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('currency')}</label>
                                <select
                                    value={data.currency}
                                    onChange={(e) => handlePresetChange(e.target.value)}
                                    className={inputClass}
                                >
                                    {currencyPresets.map((p) => (
                                        <option key={p.currency} value={p.currency}>
                                            {p.label} ({p.symbol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('currency_symbol')}</label>
                                <input
                                    type="text"
                                    value={data.currency_symbol}
                                    onChange={(e) => setData('currency_symbol', e.target.value)}
                                    className={inputClass}
                                    maxLength={5}
                                />
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('currency_symbol_help')}</p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{t('preview')}</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {data.currency_symbol}1,234.56 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({data.currency})</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Theme Settings */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">{t('theme')}</h3>
                        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{t('theme_description')}</p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleThemeChange('light')}
                                className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all ${
                                    data.theme === 'light'
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                                }`}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                    <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <span className={`text-sm font-medium ${data.theme === 'light' ? 'text-brand-600' : 'text-gray-700 dark:text-gray-300'}`}>{t('light')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleThemeChange('dark')}
                                className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all ${
                                    data.theme === 'dark'
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                                }`}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                                    <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                </div>
                                <span className={`text-sm font-medium ${data.theme === 'dark' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}`}>{t('dark')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">{t('languages')}</h3>
                        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{t('language_description')}</p>

                        {/* Display Language */}
                        <div className="mb-5">
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('display_language')}</label>
                            <select
                                value={data.locale}
                                onChange={(e) => setData('locale', e.target.value)}
                                className={inputClass}
                            >
                                <option value="en">{t('english_default')}</option>
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name} ({lang.code})
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {t('display_language_help')}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="mb-5 border-t border-gray-200 dark:border-gray-700" />

                        <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{t('translation_languages')}</h4>
                        <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">{t('translation_languages_help')}</p>

                        {/* Added Languages */}
                        {languages.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {languages.map((lang) => (
                                    <span
                                        key={lang.code}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                                    >
                                        <span className="font-mono text-xs uppercase text-brand-500">{lang.code}</span>
                                        {lang.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveLanguage(lang.code)}
                                            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-brand-100 hover:text-brand-800 dark:hover:bg-brand-500/20"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Add Language Form */}
                        <div className="space-y-3">
                            <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('language')}</label>
                                <select
                                    value=""
                                    onChange={(e) => handleSelectLanguage(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">{t('choose_language_preset')}</option>
                                    {commonLanguages
                                        .filter(l => !languages.some(added => added.code === l.code))
                                        .map((l) => (
                                            <option key={l.code} value={l.code}>
                                                {l.name} ({l.code})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-24">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('code')}</label>
                                    <input
                                        type="text"
                                        value={newLangCode}
                                        onChange={(e) => setNewLangCode(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
                                        placeholder={t('eg_code')}
                                        className={inputClass}
                                        maxLength={5}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('name')}</label>
                                    <input
                                        type="text"
                                        value={newLangName}
                                        onChange={(e) => setNewLangName(e.target.value)}
                                        placeholder={t('eg_language_name')}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={handleAddLanguage}
                                        disabled={!newLangCode.trim() || !newLangName.trim()}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        {t('add')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                        >
                            {processing ? t('saving') : t('save_settings')}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
