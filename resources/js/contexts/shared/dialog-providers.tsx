import { FolderProviders } from '@/contexts/folders/folder-providers';
import { PasswordProviders } from '@/contexts/passwords/password-providers';
import { FC, ReactNode } from 'react';

interface DialogProvidersProps {
    children: ReactNode;
}

export const DialogProviders: FC<DialogProvidersProps> = ({ children }) => {
    return (
        <PasswordProviders>
            <FolderProviders>{children}</FolderProviders>
        </PasswordProviders>
    );
};
