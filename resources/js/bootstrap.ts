import { __, setTranslations } from '@/lib/i18n';

(globalThis as any).__ = __;
(globalThis as any).setTranslations = setTranslations;

if (typeof window !== 'undefined' && '__translations' in window) {
    setTranslations((window as any).__translations);
}
