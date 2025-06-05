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
