import { useEffect } from 'react';
import { useTranslation } from '@/utils/translation';

interface ConfirmModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    processing?: boolean;
}

const variantStyles = {
    danger: {
        icon: 'text-error-500 bg-error-100 dark:bg-error-500/20',
        button: 'bg-error-500 hover:bg-error-600 focus:ring-error-500',
    },
    warning: {
        icon: 'text-warning-500 bg-warning-100 dark:bg-warning-500/20',
        button: 'bg-warning-500 hover:bg-warning-600 focus:ring-warning-500',
    },
    info: {
        icon: 'text-brand-500 bg-brand-100 dark:bg-brand-500/20',
        button: 'bg-brand-500 hover:bg-brand-600 focus:ring-brand-500',
    },
};

export default function ConfirmModal({
    show,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant = 'danger',
    processing = false,
}: ConfirmModalProps) {
    const { t } = useTranslation();
    const resolvedTitle = title ?? t('confirm_action');
    const resolvedMessage = message ?? t('confirm_action_message');
    const resolvedConfirmLabel = confirmLabel ?? t('confirm');
    const resolvedCancelLabel = cancelLabel ?? t('cancel');

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !processing) onClose();
        };

        if (show) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [show, onClose, processing]);

    if (!show) return null;

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={() => !processing && onClose()}
            />

            {/* Modal panel */}
            <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.icon}`}>
                            {variant === 'danger' ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            ) : variant === 'warning' ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{resolvedTitle}</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{resolvedMessage}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                        {resolvedCancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 ${styles.button}`}
                    >
                        {processing ? t('processing') : resolvedConfirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
