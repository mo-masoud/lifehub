import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
    const __: (key: string, params: Record<string, string | number> = {}) => string;
    const translations: Record<string, any>;
}
