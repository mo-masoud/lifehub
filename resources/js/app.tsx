import '../css/app.css';
import './bootstrap';

import { Toaster } from '@/components/ui/sonner';
import { DialogProviders } from '@/contexts/dialog-providers';
import { initializeTheme } from '@/hooks/use-appearance';
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
            <DialogProviders>
                <App {...props} />
                <Toaster richColors />
            </DialogProviders>,
        );
    },
    progress: {
        color: '#171717',
    },
});

// This will set light / dark mode on load...
initializeTheme();
