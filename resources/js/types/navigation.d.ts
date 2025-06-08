import { LucideIcon } from 'lucide-react';

export interface NavSubItem {
    label: string;
    icon?: LucideIcon;
    href?: string;
    onClick?: () => void;
    isActive?: () => boolean;
    badge?: string | number;
    tooltip?: string;
}

export interface NavItem {
    label: string;
    title?: string;
    icon?: LucideIcon;
    href?: string;
    onClick?: () => void;
    isActive?: () => boolean;
    tooltip?: string;
    badge?: string | number;
    collapsible?: boolean;
    defaultOpen?: boolean;
    subItems?: NavSubItem[];
}

export interface NavGroup {
    label?: string;
    items: NavItem[];
}

export interface NavMainProps {
    groups?: NavGroup[];
}
