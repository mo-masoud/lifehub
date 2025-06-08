import { FC, ReactNode } from 'react';
import { FolderProviders } from './folder-providers';
import { PasswordProviders } from './password-providers';

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
