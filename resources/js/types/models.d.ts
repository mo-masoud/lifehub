export interface Password {
    id: number;
    user_id: number;
    name: string;
    url?: string;
    username: string;
    password: string;
    folder_id?: number;
    folder?: Folder;
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
    folder_id?: number;
    folder?: Folder;
    created_at: string;
    updated_at: string;
}

export interface Folder {
    id: number;
    user_id: number;
    name: string;
    passwords_count?: number;
    sshs_count?: number;
    created_at: string;
    updated_at: string;
}

export type BalanceType = 'USD' | 'EGP' | 'GOLD24' | 'GOLD21';

export interface StorageLocation {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
    balances?: {
        [key in BalanceType]: number;
    };
    total_egp?: number;
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
    total_amount?: number;
    total_year?: number;
    total_month?: number;
    total_week?: number;
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
    source_location_id: number | null;
    destination_location_id: number | null;
    source_location?: StorageLocation;
    destination_location?: StorageLocation;
    notes: string;
    date: string;
    created_at: string;
    updated_at: string;
}

export interface SavingsGoal {
    id: number;
    title: string;
    target_amount_usd: number;
    target_amount_egp: number;
    current_amount_usd: number;
    current_amount_egp: number;
    effective_target_amount_usd: number;
    effective_target_amount_egp: number;
    safety_margin_percentage: number;
    safety_margin_amount_usd: number;
    safety_margin_amount_egp: number;
    progress_percentage: number;
    effective_progress_percentage: number;
    severity: 'low' | 'medium' | 'high' | 'very-high';
    target_date: string | null;
    is_achieved: boolean;
    is_overdue: boolean;
    achieved_at: string | null;
    success_notification_dismissed: boolean;
    success_notification_shown_at: string | null;
}
