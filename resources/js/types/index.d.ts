import type { Config } from 'ziggy-js';
import { Auth } from './auth';

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    passwordsCount: number;
    [key: string]: unknown;
}

// Re-export commonly used types for convenience
export type { Auth, User } from './auth';
export type { BaseModel } from './base';
export type { BreadcrumbItem } from './breadcrumb';
export type { NavGroup, NavItem, NavMainProps, NavSubItem } from './navigation';
export type { Pagination } from './pagination';
