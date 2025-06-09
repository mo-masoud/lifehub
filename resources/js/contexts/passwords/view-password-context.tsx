import { Password } from '@/types/passwords';
import { createContext, ReactNode, useContext, useState } from 'react';

interface ViewPasswordContextType {
    password: Password | null;
    isOpen: boolean;
    openSheet: (password: Password) => void;
    closeSheet: () => void;
}

const ViewPasswordContext = createContext<ViewPasswordContextType | undefined>(undefined);

interface ViewPasswordProviderProps {
    children: ReactNode;
}

export function ViewPasswordProvider({ children }: ViewPasswordProviderProps) {
    const [password, setPassword] = useState<Password | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openSheet = (password: Password) => {
        setPassword(password);
        setIsOpen(true);
    };

    const closeSheet = () => {
        setIsOpen(false);
        setPassword(null);
    };

    return (
        <ViewPasswordContext.Provider
            value={{
                password,
                isOpen,
                openSheet,
                closeSheet,
            }}
        >
            {children}
        </ViewPasswordContext.Provider>
    );
}

export function useViewPassword() {
    const context = useContext(ViewPasswordContext);
    if (context === undefined) {
        throw new Error('useViewPassword must be used within a ViewPasswordProvider');
    }
    return context;
}
