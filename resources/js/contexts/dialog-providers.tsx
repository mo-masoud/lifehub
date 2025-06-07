import { FC, ReactNode } from 'react';
import { PasswordProviders } from './password-providers';

interface DialogProvidersProps {
    children: ReactNode;
}

export const DialogProviders: FC<DialogProvidersProps> = ({ children }) => {
    return <PasswordProviders>{children}</PasswordProviders>;
};
