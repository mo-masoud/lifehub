import { Password } from '@/types/passwords';
import { createContext, FC, ReactNode, useContext, useState } from 'react';

interface DeletePasswordContextType {
    isOpen: boolean;
    password: Password | null;
    selectedPasswordIds: Set<number> | null;
    openDialog: (password: Password) => void;
    openBulkDialog: (selectedPasswordIds: Set<number>) => void;
    closeDialog: () => void;
}

const DeletePasswordContext = createContext<DeletePasswordContextType | undefined>(undefined);

interface DeletePasswordProviderProps {
    children: ReactNode;
}

export const DeletePasswordProvider: FC<DeletePasswordProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [password, setPassword] = useState<Password | null>(null);
    const [selectedPasswordIds, setSelectedPasswordIds] = useState<Set<number> | null>(null);

    const openDialog = (password: Password) => {
        setPassword(password);
        setSelectedPasswordIds(null);
        setIsOpen(true);
    };

    const openBulkDialog = (selectedPasswordIds: Set<number>) => {
        setSelectedPasswordIds(selectedPasswordIds);
        setPassword(null);
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
        setPassword(null);
        setSelectedPasswordIds(null);
    };

    return (
        <DeletePasswordContext.Provider value={{ isOpen, password, selectedPasswordIds, openDialog, openBulkDialog, closeDialog }}>
            {children}
        </DeletePasswordContext.Provider>
    );
};

export const useDeletePassword = () => {
    const context = useContext(DeletePasswordContext);
    if (context === undefined) {
        throw new Error('useDeletePassword must be used within a DeletePasswordProvider');
    }
    return context;
};
