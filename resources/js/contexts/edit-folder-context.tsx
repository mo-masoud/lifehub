import { Folder } from '@/types/folders';
import { createContext, FC, ReactNode, useContext, useState } from 'react';

interface EditFolderContextType {
    isOpen: boolean;
    folder: Folder | null;
    openDialog: (folder: Folder) => void;
    closeDialog: () => void;
}

const EditFolderContext = createContext<EditFolderContextType | undefined>(undefined);

interface EditFolderProviderProps {
    children: ReactNode;
}

export const EditFolderProvider: FC<EditFolderProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [folder, setFolder] = useState<Folder | null>(null);

    const openDialog = (folder: Folder) => {
        setFolder(folder);
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
        // Delay clearing folder to allow dialog close animation to complete
        setTimeout(() => {
            setFolder(null);
        }, 300);
    };

    return <EditFolderContext.Provider value={{ isOpen, folder, openDialog, closeDialog }}>{children}</EditFolderContext.Provider>;
};

export const useEditFolder = () => {
    const context = useContext(EditFolderContext);
    if (context === undefined) {
        throw new Error('useEditFolder must be used within an EditFolderProvider');
    }
    return context;
};
