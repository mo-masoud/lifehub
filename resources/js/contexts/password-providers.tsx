import { GlobalCreatePasswordSheet } from '@/components/features/passwords/global-create-password-sheet';
import { GlobalDeletePasswordDialog } from '@/components/features/passwords/global-delete-password-dialog';
import { GlobalEditPasswordSheet } from '@/components/features/passwords/global-edit-password-sheet';
import { GlobalViewPasswordSheet } from '@/components/features/passwords/global-view-password-sheet';
import { CreatePasswordProvider } from '@/contexts/create-password-context';
import { DeletePasswordProvider } from '@/contexts/delete-password-context';
import { EditPasswordProvider } from '@/contexts/edit-password-context';
import { ViewPasswordProvider } from '@/contexts/view-password-context';
import { ReactNode } from 'react';

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
