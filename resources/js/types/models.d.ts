export interface Password {
    id: number;
    user_id: number;
    name: string;
    url?: string;
    username: string;
    password: string;
    created_at: string;
    updated_at: string;
}

export interface SSH {
    id: number;
    user_id: number;
    name: string;
    ip: string;
    username: string;
    password: string;
    prompt: string;
    created_at: string;
    updated_at: string;
}
