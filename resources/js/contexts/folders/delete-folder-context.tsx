import { Folder } from '@/types/folders';
import { createContext, ReactNode, useContext, useState } from 'react';

interface DeleteFolderContextType {
    isOpen: boolean;
    folder: Folder | null;
    selectedFolderIds: Set<number> | null;
    openDialog: (folder: Folder) => void;
    openBulkDialog: (selectedFolderIds: Set<number>) => void;
    closeDialog: () => void;
}

const DeleteFolderContext = createContext<DeleteFolderContextType | undefined>(undefined);

interface DeleteFolderProviderProps {
    children: ReactNode;
}

export function DeleteFolderProvider({ children }: DeleteFolderProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [folder, setFolder] = useState<Folder | null>(null);
    const [selectedFolderIds, setSelectedFolderIds] = useState<Set<number> | null>(null);

    const openDialog = (folder: Folder) => {
        setFolder(folder);
        setSelectedFolderIds(null);
        setIsOpen(true);
    };

    const openBulkDialog = (selectedFolderIds: Set<number>) => {
        setSelectedFolderIds(selectedFolderIds);
        setFolder(null);
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
        setFolder(null);
        setSelectedFolderIds(null);
    };

    return (
        <DeleteFolderContext.Provider value={{ isOpen, folder, selectedFolderIds, openDialog, openBulkDialog, closeDialog }}>
            {children}
        </DeleteFolderContext.Provider>
    );
}

export const useDeleteFolder = () => {
    const context = useContext(DeleteFolderContext);
    if (context === undefined) {
        throw new Error('useDeleteFolder must be used within a DeleteFolderProvider');
    }
    return context;
};
