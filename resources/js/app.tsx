import '../css/app.css';

import { GlobalCreatePasswordSheet } from '@/components/passwords/global-create-password-sheet';
import { GlobalDeletePasswordDialog } from '@/components/passwords/global-delete-password-dialog';
import { GlobalEditPasswordSheet } from '@/components/passwords/global-edit-password-sheet';
import { Toaster } from '@/components/ui/sonner';
import { CreatePasswordProvider } from '@/contexts/create-password-context';
import { DeletePasswordProvider } from '@/contexts/delete-password-context';
import { EditPasswordProvider } from '@/contexts/edit-password-context';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <CreatePasswordProvider>
                <EditPasswordProvider>
                    <DeletePasswordProvider>
                        <App {...props} />
                        <GlobalCreatePasswordSheet />
                        <GlobalEditPasswordSheet />
                        <GlobalDeletePasswordDialog />
                        <Toaster richColors />
                    </DeletePasswordProvider>
                </EditPasswordProvider>
            </CreatePasswordProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
