import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from '@/utils/translation';

interface FilterOption {
    label: string;
    value: string;
}

interface SelectFilter {
    name: string;
    label: string;
    options: FilterOption[];
}

interface SearchFilterProps {
    searchValue?: string;
    searchPlaceholder?: string;
    filters?: (SelectFilter & { value?: string })[];
    filterValues?: Record<string, string>;
    url?: string;
    routeName?: string;
}

export default function SearchFilter({
    searchValue = '',
    searchPlaceholder,
    filters = [],
    filterValues = {},
    url,
    routeName,
}: SearchFilterProps) {
    const { t } = useTranslation();
    const resolvedPlaceholder = searchPlaceholder ?? t('search');
    const targetUrl = url || routeName || '';
    const [search, setSearch] = useState(searchValue);
    const isFirstRender = useRef(true);

    // Build merged filter values from both filterValues prop and inline filter.value
    const getFilterParams = (): Record<string, string> => {
        const params: Record<string, string> = { ...filterValues };
        filters.forEach((filter) => {
            if (filter.value && !params[filter.name]) {
                params[filter.name] = filter.value;
            }
        });
        return params;
    };

    const getFilterValue = (filterName: string): string => {
        return filterValues[filterName] || filters.find((f) => f.name === filterName)?.value || '';
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const params: Record<string, string> = getFilterParams();
            if (search) params.search = search;
            Object.keys(params).forEach((key) => {
                if (!params[key]) delete params[key];
            });

            router.get(targetUrl, params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleFilterChange = (name: string, value: string) => {
        const params: Record<string, string> = { ...getFilterParams(), [name]: value };
        if (search) params.search = search;
        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });

        router.get(targetUrl, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search input */}
            <div className="relative flex-1">
                <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={resolvedPlaceholder}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-brand-400"
                />
            </div>

            {/* Select filters */}
            {filters.map((filter) => (
                <select
                    key={filter.name}
                    value={getFilterValue(filter.name)}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-brand-400"
                >
                    <option value="">{filter.label}</option>
                    {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ))}
        </div>
    );
}
