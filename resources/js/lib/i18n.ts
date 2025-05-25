let translations: Record<string, any> = {};

export function setTranslations(data: Record<string, any>) {
    translations = data;
    (globalThis as any).translations = data;
}

export function __(key: string, params: Record<string, string | number | undefined> = {}): string {
    if (!key || typeof key !== 'string') return key;
    const parts = key.split('.');
    let value: any = (globalThis as any).translations || translations || {};

    for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
            value = value[part];
        } else {
            return key;
        }
    }

    if (typeof value !== 'string') return key;

    return value.replace(/:([a-zA-Z0-9_]+)/g, (_, match) => {
        return params[match] !== undefined ? String(params[match]) : `:${match}`;
    });
}
