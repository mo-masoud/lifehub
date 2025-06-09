import { createContext, ReactNode, useContext, useState } from 'react';

interface CreatePasswordContextType {
    isOpen: boolean;
    openSheet: () => void;
    closeSheet: () => void;
}

const CreatePasswordContext = createContext<CreatePasswordContextType | undefined>(undefined);

interface CreatePasswordProviderProps {
    children: ReactNode;
}

export function CreatePasswordProvider({ children }: CreatePasswordProviderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openSheet = () => setIsOpen(true);
    const closeSheet = () => setIsOpen(false);

    return <CreatePasswordContext.Provider value={{ isOpen, openSheet, closeSheet }}>{children}</CreatePasswordContext.Provider>;
}

export const useCreatePassword = () => {
    const context = useContext(CreatePasswordContext);
    if (context === undefined) {
        throw new Error('useCreatePassword must be used within a CreatePasswordProvider');
    }
    return context;
};
