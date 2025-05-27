import { applyColorTheme, defaultColorTheme, getColorTheme, type ColorTheme } from '@/lib/color-themes';
import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance, colorTheme?: ColorTheme) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);

    // Apply color theme if provided
    if (colorTheme) {
        applyColorTheme(colorTheme, isDark);
    }
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    const currentColorTheme = localStorage.getItem('colorTheme');
    const theme = currentColorTheme ? getColorTheme(currentColorTheme) : defaultColorTheme;

    applyTheme(currentAppearance || 'system', theme);
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';
    const savedColorTheme = localStorage.getItem('colorTheme');
    const theme = savedColorTheme ? getColorTheme(savedColorTheme) : defaultColorTheme;

    applyTheme(savedAppearance, theme);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');
    const [colorTheme, setColorTheme] = useState<ColorTheme>(defaultColorTheme);

    const updateAppearance = useCallback(
        (mode: Appearance) => {
            setAppearance(mode);

            // Store in localStorage for client-side persistence...
            localStorage.setItem('appearance', mode);

            // Store in cookie for SSR...
            setCookie('appearance', mode);

            applyTheme(mode, colorTheme);
        },
        [colorTheme],
    );

    const updateColorTheme = useCallback(
        (theme: ColorTheme) => {
            setColorTheme(theme);

            // Store in localStorage for client-side persistence...
            localStorage.setItem('colorTheme', theme.name);

            // Store in cookie for SSR...
            setCookie('colorTheme', theme.name);

            applyTheme(appearance, theme);
        },
        [appearance],
    );

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        const savedColorTheme = localStorage.getItem('colorTheme');

        if (savedAppearance) {
            setAppearance(savedAppearance);
        }

        if (savedColorTheme) {
            const theme = getColorTheme(savedColorTheme);
            if (theme) {
                setColorTheme(theme);
            }
        }

        // Apply the theme with the current settings
        const finalTheme = savedColorTheme ? getColorTheme(savedColorTheme) || defaultColorTheme : defaultColorTheme;
        applyTheme(savedAppearance || 'system', finalTheme);

        return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance, colorTheme, updateColorTheme } as const;
}
