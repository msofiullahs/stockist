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

function ChevronIcon({ open }: { open: boolean }) {
    return (
        <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
}

function AccordionSection({ id, title, description, icon, open, onToggle, children }: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    open: boolean;
    onToggle: (id: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <button
                type="button"
                onClick={() => onToggle(id)}
                className="flex w-full items-center gap-4 p-5 text-left"
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
                <ChevronIcon open={open} />
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="border-t border-gray-200 p-5 dark:border-gray-700">
                    {children}
                </div>
            </div>
        </div>
    );
}

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
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({ app_name: true });

    const { data, setData, put, processing, errors } = useForm({
        app_name: settings.app_name || 'Stockist',
        currency: settings.currency || 'USD',
        currency_symbol: settings.currency_symbol || '$',
        theme: settings.theme || 'light',
        languages: JSON.stringify(existingLanguages),
        locale: settings.locale || 'en',
        mail_enabled: settings.mail_enabled || '0',
        mail_mailer: settings.mail_mailer || 'smtp',
        mail_host: settings.mail_host || '',
        mail_port: settings.mail_port || '587',
        mail_username: settings.mail_username || '',
        mail_password: settings.mail_password || '',
        mail_encryption: settings.mail_encryption || 'tls',
        mail_from_address: settings.mail_from_address || '',
        mail_from_name: settings.mail_from_name || '',
    });

    const toggleSection = (id: string) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

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
                <form onSubmit={submit} className="space-y-3">

                    {/* App Name */}
                    <AccordionSection
                        id="app_name"
                        title={t('app_name')}
                        description={t('app_name_description')}
                        icon={
                            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        }
                        open={!!openSections.app_name}
                        onToggle={toggleSection}
                    >
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
                    </AccordionSection>

                    {/* Currency */}
                    <AccordionSection
                        id="currency"
                        title={t('currency')}
                        description={t('currency_description')}
                        icon={
                            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        open={!!openSections.currency}
                        onToggle={toggleSection}
                    >
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
                    </AccordionSection>

                    {/* Theme */}
                    <AccordionSection
                        id="theme"
                        title={t('theme')}
                        description={t('theme_description')}
                        icon={
                            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        }
                        open={!!openSections.theme}
                        onToggle={toggleSection}
                    >
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
                    </AccordionSection>

                    {/* Languages */}
                    <AccordionSection
                        id="languages"
                        title={t('languages')}
                        description={t('language_description')}
                        icon={
                            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                        }
                        open={!!openSections.languages}
                        onToggle={toggleSection}
                    >
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
                    </AccordionSection>

                    {/* Email Notifications */}
                    <AccordionSection
                        id="email"
                        title={t('email_notifications')}
                        description={t('email_notifications_description')}
                        icon={
                            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }
                        open={!!openSections.email}
                        onToggle={toggleSection}
                    >
                        {/* Enable/Disable Toggle */}
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('enable_email_notifications')}</h4>
                                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{t('enable_email_notifications_help')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setData('mail_enabled', data.mail_enabled === '1' ? '0' : '1')}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                                    data.mail_enabled === '1' ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            >
                                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                                    data.mail_enabled === '1' ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                            </button>
                        </div>

                        {/* Mail Config Fields */}
                        <div className={`space-y-4 transition-opacity duration-200 ${data.mail_enabled === '1' ? 'opacity-100' : 'pointer-events-none opacity-40'}`}>
                            <div className="border-t border-gray-200 pt-4 dark:border-gray-700" />

                            {/* Mailer */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mail_driver')}</label>
                                <select
                                    value={data.mail_mailer}
                                    onChange={(e) => setData('mail_mailer', e.target.value)}
                                    className={inputClass}
                                    disabled={data.mail_enabled !== '1'}
                                >
                                    <option value="smtp">SMTP</option>
                                    <option value="sendmail">Sendmail</option>
                                    <option value="log">Log ({t('testing_only')})</option>
                                </select>
                            </div>

                            {/* Host & Port */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mail_host')}</label>
                                    <input
                                        type="text"
                                        value={data.mail_host}
                                        onChange={(e) => setData('mail_host', e.target.value)}
                                        className={inputClass}
                                        placeholder="smtp.gmail.com"
                                        disabled={data.mail_enabled !== '1'}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mail_port')}</label>
                                    <input
                                        type="text"
                                        value={data.mail_port}
                                        onChange={(e) => setData('mail_port', e.target.value)}
                                        className={inputClass}
                                        placeholder="587"
                                        disabled={data.mail_enabled !== '1'}
                                    />
                                </div>
                            </div>

                            {/* Username & Password */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mail_username')}</label>
                                    <input
                                        type="text"
                                        value={data.mail_username}
                                        onChange={(e) => setData('mail_username', e.target.value)}
                                        className={inputClass}
                                        placeholder={t('enter_email')}
                                        disabled={data.mail_enabled !== '1'}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mail_password')}</label>
                                    <input
                                        type="password"
                                        value={data.mail_password}
                                        onChange={(e) => setData('mail_password', e.target.value)}
                                        className={inputClass}
                                        placeholder="••••••••"
                                        disabled={data.mail_enabled !== '1'}
                                    />
                                </div>
                            </div>

                            {/* Encryption */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mail_encryption')}</label>
                                <select
                                    value={data.mail_encryption}
                                    onChange={(e) => setData('mail_encryption', e.target.value)}
                                    className={inputClass}
                                    disabled={data.mail_enabled !== '1'}
                                >
                                    <option value="tls">TLS</option>
                                    <option value="ssl">SSL</option>
                                    <option value="none">{t('none')}</option>
                                </select>
                            </div>

                            <div className="border-t border-gray-200 pt-4 dark:border-gray-700" />

                            {/* From Address & Name */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mail_from_address')}</label>
                                    <input
                                        type="email"
                                        value={data.mail_from_address}
                                        onChange={(e) => setData('mail_from_address', e.target.value)}
                                        className={inputClass}
                                        placeholder="noreply@example.com"
                                        disabled={data.mail_enabled !== '1'}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mail_from_name')}</label>
                                    <input
                                        type="text"
                                        value={data.mail_from_name}
                                        onChange={(e) => setData('mail_from_name', e.target.value)}
                                        className={inputClass}
                                        placeholder="Stockist"
                                        disabled={data.mail_enabled !== '1'}
                                    />
                                </div>
                            </div>
                        </div>
                    </AccordionSection>

                    {/* Save */}
                    <div className="flex justify-end pt-3">
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
