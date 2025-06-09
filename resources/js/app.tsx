import '../css/app.css';
import './bootstrap';

import { Toaster } from '@/components/ui/sonner';
import { ModalProviders } from '@/contexts/shared/modal-providers';
import { initializeTheme } from '@/hooks/shared/use-appearance';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ModalProviders>
                <App {...props} />
                <Toaster richColors />
            </ModalProviders>,
        );
    },
    progress: {
        color: '#171717',
    },
});

// This will set light / dark mode on load...
initializeTheme();
