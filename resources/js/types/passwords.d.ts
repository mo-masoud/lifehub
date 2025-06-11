import { BaseModel } from './base';
import { Folder } from './folders';

export type SortKey = 'name' | 'username' | 'last_used_at';
export type SortDirection = 'asc' | 'desc';
export type PasswordType = 'normal' | 'ssh';
export type PasswordsType = 'normal' | 'ssh';

export interface PasswordSort {
    key: SortKey;
    direction: SortDirection;
}

export interface PasswordFilters {
    folderId?: string;
    sort: SortKey;
    direction: SortDirection;
    search?: string;
    type?: PasswordType;
    perPage?: number;
    expiryFilter?: 'all' | 'expired' | 'expires_soon';
}

export interface Password extends BaseModel {
    type: PasswordsType;
    name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
    folder_id?: number;
    copied: number;
    last_used_at?: Date;
    last_used_at_formatted: string;
    expires_at?: Date;
    expires_at_formatted: string;
    cli?: string;
    is_expired?: boolean;
    password_power?: {
        label: string;
        score: number;
        feedback: string[];
    };
    is_expired_soon?: boolean;
    folder?: Folder;
}

export interface PasswordStatsData {
    type_distribution: {
        normal: number;
        ssh: number;
    };
    top_copied_passwords: Array<{
        id: number;
        name: string;
        copied: number;
        type: string;
    }>;
    total_copied_count: number;
    security_health: {
        strong: number;
        medium: number;
        weak: number;
    };
}
