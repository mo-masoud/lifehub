import { GlobalNotificationsSheet } from '@/components/shared/global-notifications-sheet';
import { FolderProviders } from '@/contexts/folders/folder-providers';
import { PasswordProviders } from '@/contexts/passwords/password-providers';
import { NotificationsProvider } from '@/contexts/shared/notifications-context';
import { ReactNode } from 'react';

interface ModalProvidersProps {
    children: ReactNode;
}

export function ModalProviders({ children }: ModalProvidersProps) {
    return (
        <NotificationsProvider>
            <PasswordProviders>
                <FolderProviders>
                    {children}
                    <GlobalNotificationsSheet />
                </FolderProviders>
            </PasswordProviders>
        </NotificationsProvider>
    );
}
