import { BaseModel } from './base';

export interface Folder extends BaseModel {
    name: string;
    featured: boolean;
    passwords_count: number;
}

export interface FolderFilters {
    search?: string;
    sort?: FolderSortKey;
    direction?: 'asc' | 'desc';
    per_page?: number;
}

export type FolderSortKey = 'name' | 'passwords_count' | 'created_at' | 'updated_at';
