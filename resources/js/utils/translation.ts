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

    const t = (key: string, params?: Record<string, string | number>, fallback?: string): string => {
        let text = (translations && translations[key])
            ? translations[key]
            : (fallback ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));

        // Replace :param placeholders with actual values
        if (params) {
            Object.entries(params).forEach(([param, value]) => {
                text = text.replace(new RegExp(`:${param}`, 'g'), String(value));
            });
        }

        return text;
    };

    return { t };
}
