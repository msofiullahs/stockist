interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'error' | 'warning' | 'info' | 'gray';
}

const variantStyles: Record<string, string> = {
    success: 'bg-success-500/10 text-success-500',
    error: 'bg-error-500/10 text-error-500',
    warning: 'bg-warning-500/10 text-warning-500',
    info: 'bg-brand-500/10 text-brand-500',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export default function Badge({ children, variant = 'gray' }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant]}`}
        >
            {children}
        </span>
    );
}
