import { GlobalCreatePasswordSheet } from '@/components/features/passwords/global-create-password-sheet';
import { GlobalDeletePasswordDialog } from '@/components/features/passwords/global-delete-password-dialog';
import { GlobalEditPasswordSheet } from '@/components/features/passwords/global-edit-password-sheet';
import { GlobalViewPasswordSheet } from '@/components/features/passwords/global-view-password-sheet';
import { ReactNode } from 'react';
import { CreatePasswordProvider } from './create-password-context';
import { DeletePasswordProvider } from './delete-password-context';
import { EditPasswordProvider } from './edit-password-context';
import { ViewPasswordProvider } from './view-password-context';

interface PasswordProvidersProps {
    children: ReactNode;
}

export function PasswordProviders({ children }: PasswordProvidersProps) {
    return (
        <CreatePasswordProvider>
            <EditPasswordProvider>
                <ViewPasswordProvider>
                    <DeletePasswordProvider>
                        {children}
                        <GlobalCreatePasswordSheet />
                        <GlobalEditPasswordSheet />
                        <GlobalViewPasswordSheet />
                        <GlobalDeletePasswordDialog />
                    </DeletePasswordProvider>
                </ViewPasswordProvider>
            </EditPasswordProvider>
        </CreatePasswordProvider>
    );
}
