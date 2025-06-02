export type PasswordsType = 'normal' | 'ssh';

export interface BaseModel {
    id: number;
    created_at: Date;
    updated_at: Date;
}

export interface Folder extends BaseModel {
    name: string;
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
    expires_at?: Date;
    cli?: string;
    is_expired?: boolean;
    is_expired_soon?: boolean;
    folder?: Folder;
}
