export interface Pagination<T> {
    data: T[];
    current_page: number;
    first_page_url?: string;
    last_page_url?: string;
    from: number;
    to: number;
    next_page_url?: string;
    path: string;
    prev_page_url?: string;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    [key: string]: unknown; // This allows for additional properties...
}
