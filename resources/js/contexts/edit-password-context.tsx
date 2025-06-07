import { Password } from '@/types/models';
import { createContext, FC, ReactNode, useContext, useState } from 'react';

interface EditPasswordContextType {
    isOpen: boolean;
    password: Password | null;
    openSheet: (password: Password) => void;
    closeSheet: () => void;
}

const EditPasswordContext = createContext<EditPasswordContextType | undefined>(undefined);

interface EditPasswordProviderProps {
    children: ReactNode;
}

export const EditPasswordProvider: FC<EditPasswordProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [password, setPassword] = useState<Password | null>(null);

    const openSheet = (password: Password) => {
        setPassword(password);
        setIsOpen(true);
    };

    const closeSheet = () => {
        setIsOpen(false);
        setPassword(null);
    };

    return <EditPasswordContext.Provider value={{ isOpen, password, openSheet, closeSheet }}>{children}</EditPasswordContext.Provider>;
};

export const useEditPassword = () => {
    const context = useContext(EditPasswordContext);
    if (context === undefined) {
        throw new Error('useEditPassword must be used within an EditPasswordProvider');
    }
    return context;
};
