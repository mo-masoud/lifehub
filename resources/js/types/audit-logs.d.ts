import { BaseModel } from './base';
import { Password } from './passwords';

export type SortKey = 'created_at' | 'action';
export type SortDirection = 'asc' | 'desc';
export type ActionType = 'created' | 'updated' | 'deleted' | 'copied' | 'viewed' | 'bulk_deleted' | 'moved_to_folder' | 'removed_from_folder';

export interface AuditLog extends BaseModel {
    password_id: number;
    user_id: number;
    action: ActionType;
    ip_address?: string;
    context: string;
    metadata?: Record<string, unknown>;
    created_at: Date;
    created_at_formatted: string;
    action_display: string;
    masked_password_name: string;
    password?: Password;
}

export interface AuditLogFilters {
    passwordId?: number;
    action?: ActionType;
    startDate?: string;
    endDate?: string;
    search?: string;
    perPage?: number;
    sort: SortKey;
    direction: SortDirection;
}

export interface AuditLogSort {
    key: SortKey;
    direction: SortDirection;
}
