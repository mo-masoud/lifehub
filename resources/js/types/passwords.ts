export type SortKey = 'name' | 'username' | 'last_used_at';
export type SortDirection = 'asc' | 'desc';
export type PasswordType = 'normal' | 'ssh';

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
}
