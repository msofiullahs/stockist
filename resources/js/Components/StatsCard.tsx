import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    variant?: 'default' | 'error';
    trend?: {
        value: string;
        positive: boolean;
    };
}

const iconStyles = {
    default: 'bg-brand-500/10 text-brand-500 dark:bg-brand-500/20',
    error: 'bg-error-500/10 text-error-500 dark:bg-error-500/20',
};

export default function StatsCard({ title, value, icon, variant = 'default', trend }: StatsCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
                    {trend && (
                        <p
                            className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                                trend.positive ? 'text-success-500' : 'text-error-500'
                            }`}
                        >
                            {trend.positive ? (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            ) : (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            )}
                            {trend.value}
                        </p>
                    )}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconStyles[variant]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
