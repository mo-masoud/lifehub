export interface LatestSnapshotTotals {
    date: string;
    total_egp: number;
    total_usd: number;
}

export interface Transaction {
    amount: number;
    amount_egp: number;
    amount_usd: number;
    date: string;
    category: string | null;
    category_id: number | null;
    notes: string | null;
    period: string;
    type: string;
}

export interface TopTransactions {
    week: Transaction | null;
    month: Transaction | null;
    quarter: Transaction | null;
    year: Transaction | null;
}

export interface TotalByPeriod {
    week: number;
    month: number;
    quarter: number;
    year: number;
}

export interface CategoryExpense {
    id: number;
    name: string;
    total_egp: number;
    total_usd: number;
}

export interface TopCategoriesByPeriod {
    week: CategoryExpense[];
    month: CategoryExpense[];
    quarter: CategoryExpense[];
    year: CategoryExpense[];
    overall: CategoryExpense[];
}
