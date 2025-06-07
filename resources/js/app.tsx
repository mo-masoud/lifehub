import '../css/app.css';

import { Toaster } from '@/components/ui/sonner';
import { CreatePasswordProvider } from '@/contexts/create-password-context';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { GlobalCreatePasswordSheet } from './components/passwords/global-create-password-sheet';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <CreatePasswordProvider>
                <App {...props} />
                <GlobalCreatePasswordSheet />
                <Toaster richColors />
            </CreatePasswordProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
