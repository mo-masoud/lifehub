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

export type BalanceType = 'USD' | 'EGP' | 'GOLD24' | 'GOLD21';

export interface StorageLocation {
    id: string;
    name: string;
    created_at: string;
}

export interface Balance {
    id: string;
    user_id: number;
    amount: number;
    type: BalanceType;
    storage_location: StorageLocation;
    created_at: string;
    updated_at: string;
}
