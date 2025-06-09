import { FolderProviders } from '@/contexts/folders/folder-providers';
import { PasswordProviders } from '@/contexts/passwords/password-providers';
import { FC, ReactNode } from 'react';

interface ModalProvidersProps {
    children: ReactNode;
}

export const ModalProviders: FC<ModalProvidersProps> = ({ children }) => {
    return (
        <PasswordProviders>
            <FolderProviders>{children}</FolderProviders>
        </PasswordProviders>
    );
};
