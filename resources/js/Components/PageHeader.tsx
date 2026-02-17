import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Breadcrumb {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs?: Breadcrumb[];
    actions?: ReactNode;
}

export default function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        {breadcrumbs.map((crumb, index) => (
                            <span key={index} className="flex items-center gap-1.5">
                                {index > 0 && (
                                    <svg className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="transition-colors hover:text-brand-500"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-gray-800 dark:text-gray-200">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
