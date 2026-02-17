import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

/**
 * Translation hook that reads the active locale's translations
 * from shared Inertia props and returns a `t()` function.
 *
 * Usage:
 *   const { t } = useTranslation();
 *   t('dashboard') // => "Dashboard" or translated value
 */
export function useTranslation() {
    const { translations } = usePage<PageProps>().props;

    const t = (key: string, fallback?: string): string => {
        if (translations && translations[key]) {
            return translations[key];
        }
        // If no translation found, use fallback or convert key to readable text
        return fallback ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    return { t };
}
