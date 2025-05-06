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

export interface SnapshotItem {
    id: string;
    type: string;
    amount: number;
    rate: number;
    storage_location: StorageLocation;
    created_at: string;
    updated_at: string;
}

export interface Snapshot {
    id: string;
    user_id: number;
    usd_rate: number;
    gold24_price: number;
    gold21_price: number;
    date: string;
    total_egp: number;
    total_usd: number;
    created_at: string;
    updated_at: string;
    items: SnapshotItem[];
}

export interface TransactionCategory {
    id: string;
    name: string;
    direction: string;
    created_at: string;
}

export interface Transaction {
    id: string;
    user_id: number;
    amount: number;
    direction: string;
    type: string;
    storage_location: StorageLocation;
    category: TransactionCategory;
    from_type: string;
    from_amount: string;
    notes: string;
    date: string;
    created_at: string;
    updated_at: string;
}
