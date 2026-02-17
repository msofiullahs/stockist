import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function useFormatCurrency() {
    const { settings } = usePage<PageProps>().props;
    const symbol = settings?.currency_symbol || '$';

    return (value: number | string): string => {
        const num = Number(value) || 0;
        return `${symbol}${num.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
}
