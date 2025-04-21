import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    locale: string;
    dir: 'ltr' | 'rtl';

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
    current_page: number,
    data: T[],
    first_page_url: string,
    from?: string,
    last_page: number,
    last_page_url: string,
    links: {
        url?: string,
        label: string,
        active: boolean
    }[],
    next_page_url?: string,
    path?: string,
    per_page: number,
    prev_page_url?: string,
    to?: string,
    total: number
}
