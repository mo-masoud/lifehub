import { FolderProviders } from '@/contexts/folders/folder-providers';
import { PasswordProviders } from '@/contexts/passwords/password-providers';
import { ReactNode } from 'react';

interface ModalProvidersProps {
    children: ReactNode;
}

export function ModalProviders({ children }: ModalProvidersProps) {
    return (
        <PasswordProviders>
            <FolderProviders>{children}</FolderProviders>
        </PasswordProviders>
    );
}
