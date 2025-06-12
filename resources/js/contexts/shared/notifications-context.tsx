import { createContext, useContext, useState } from 'react';

interface NotificationsContextType {
    isOpen: boolean;
    openSheet: () => void;
    closeSheet: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
}

interface NotificationsProviderProps {
    children: React.ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openSheet = () => setIsOpen(true);
    const closeSheet = () => setIsOpen(false);

    return <NotificationsContext.Provider value={{ isOpen, openSheet, closeSheet }}>{children}</NotificationsContext.Provider>;
}
