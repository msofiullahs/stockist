import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

createInertiaApp({
    title: (title) => {
        const appName = (document as any).__stockistAppName || 'Stockist';
        return title ? `${title} - ${appName}` : appName;
    },
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true }) as Record<string, any>;
        return pages[`./Pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
        // Apply theme and app name from server settings on initial load
        const settings = (props.initialPage.props as any)?.settings;
        if (settings?.theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
        if (settings?.app_name) {
            (document as any).__stockistAppName = settings.app_name;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#3366FF',
        showSpinner: true,
    },
});
