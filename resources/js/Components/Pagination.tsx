import { Link } from '@inertiajs/react';
import { useTranslation } from '@/utils/translation';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    currentPage: number;
    lastPage: number;
}

export default function Pagination({ links, currentPage, lastPage }: PaginationProps) {
    const { t } = useTranslation();

    if (lastPage <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('page')} <span className="font-medium">{currentPage}</span> {t('of')}{' '}
                        <span className="font-medium">{lastPage}</span>
                    </p>
                </div>
                <nav className="isolate inline-flex -space-x-px rounded-lg" aria-label="Pagination">
                    {links.map((link, index) => {
                        const label = link.label
                            .replace('&laquo;', '\u00AB')
                            .replace('&raquo;', '\u00BB');

                        if (!link.url) {
                            return (
                                <span
                                    key={index}
                                    className="relative inline-flex items-center px-3 py-2 text-sm text-gray-300 ring-1 ring-inset ring-gray-200 first:rounded-l-lg last:rounded-r-lg dark:text-gray-600 dark:ring-gray-700"
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={link.url}
                                className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ring-1 ring-inset ring-gray-200 transition-colors first:rounded-l-lg last:rounded-r-lg dark:ring-gray-700 ${
                                    link.active
                                        ? 'z-10 bg-brand-500 text-white ring-brand-500'
                                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        );
                    })}
                </nav>
            </div>
            {/* Mobile pagination */}
            <div className="flex flex-1 justify-between sm:hidden">
                {links[0]?.url ? (
                    <Link
                        href={links[0].url}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        {t('previous')}
                    </Link>
                ) : (
                    <span className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-300 dark:border-gray-700 dark:text-gray-600">
                        {t('previous')}
                    </span>
                )}
                {links[links.length - 1]?.url ? (
                    <Link
                        href={links[links.length - 1].url!}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        {t('next')}
                    </Link>
                ) : (
                    <span className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-300 dark:border-gray-700 dark:text-gray-600">
                        {t('next')}
                    </span>
                )}
            </div>
        </div>
    );
}
