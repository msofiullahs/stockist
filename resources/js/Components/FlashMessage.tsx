import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/utils/translation';

interface FlashMessageProps {
    type: 'success' | 'error';
    message: string;
}

export default function FlashMessage({ type, message }: FlashMessageProps) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(true);

    useEffect(() => {
        // Trigger slide-down animation
        requestAnimationFrame(() => setVisible(true));

        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => setMounted(false), 300);
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return null;

    const styles = {
        success: 'border-success-500 bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 dark:border-success-500/50',
        error: 'border-error-500 bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500 dark:border-error-500/50',
    };

    const icons = {
        success: (
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    // Parse messages with parameters (format: "key:param1:param2")
    // e.g., "flash_import_success:5:2" → t('flash_import_success', { imported: '5', skipped: '2' })
    const parseMessage = (msg: string): string => {
        if (msg.startsWith('flash_import_success:')) {
            const parts = msg.split(':');
            return t('flash_import_success', { imported: parts[1] || '0', skipped: parts[2] || '0' });
        }
        return t(msg);
    };

    const translatedMessage = parseMessage(message);

    return createPortal(
        <div
            className={`fixed left-1/2 z-[9999] -translate-x-1/2 transition-all duration-300 ease-out ${
                visible ? 'top-4 opacity-100' : '-top-16 opacity-0'
            }`}
        >
            <div className={`flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${styles[type]}`}>
                {icons[type]}
                <span className="whitespace-nowrap">{translatedMessage}</span>
                <button onClick={() => { setVisible(false); setTimeout(() => setMounted(false), 300); }} className="ml-3 opacity-70 transition-opacity hover:opacity-100">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>,
        document.body
    );
}
