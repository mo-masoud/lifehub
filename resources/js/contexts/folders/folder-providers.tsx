import { GlobalDeleteFolderDialog } from '@/components/features/folders/global-delete-folder-dialog';
import { GlobalEditFolderDialog } from '@/components/features/folders/global-edit-folder-dialog';
import { DeleteFolderProvider } from '@/contexts/folders/delete-folder-context';
import { EditFolderProvider } from '@/contexts/folders/edit-folder-context';
import { ReactNode } from 'react';

interface FolderProvidersProps {
    children: ReactNode;
}

export function FolderProviders({ children }: FolderProvidersProps) {
    return (
        <EditFolderProvider>
            <DeleteFolderProvider>
                {children}
                <GlobalEditFolderDialog />
                <GlobalDeleteFolderDialog />
            </DeleteFolderProvider>
        </EditFolderProvider>
    );
}
