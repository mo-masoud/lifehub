import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

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
    icon: LucideIcon;
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

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    passwordsCount: number;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Pagination<T> {
    data: T[];
    current_page: number;
    first_page_url?: string;
    last_page_url?: string;
    from: number;
    to: number;
    next_page_url?: string;
    path: string;
    prev_page_url?: string;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    [key: string]: unknown; // This allows for additional properties...
}
