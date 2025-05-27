/**
 * Color theme definitions for LifeHub
 * Based on shadcn/ui color palettes with support for light and dark modes
 */

export type ColorTheme = {
    name: string;
    label: string;
    preview: string; // Main color for preview
    cssClass: string;
    colors: {
        light: ColorTokens;
        dark: ColorTokens;
    };
};

export type ColorTokens = {
    primary: string;
    primaryForeground: string;
    sidebarPrimary?: string;
    sidebarPrimaryForeground?: string;
    sidebarRing?: string;
    ring: string;
};

export const colorThemes: ColorTheme[] = [
    {
        name: 'violet',
        label: 'Violet',
        preview: 'oklch(0.606 0.25 292.717)',
        cssClass: 'theme-violet',
        colors: {
            light: {
                primary: 'oklch(0.606 0.25 292.717)',
                primaryForeground: 'oklch(0.969 0.016 293.756)',
                sidebarPrimary: 'oklch(0.606 0.25 292.717)',
                sidebarPrimaryForeground: 'oklch(0.969 0.016 293.756)',
                sidebarRing: 'oklch(0.606 0.25 292.717)',
                ring: 'oklch(0.606 0.25 292.717)',
            },
            dark: {
                primary: 'oklch(0.541 0.281 293.009)',
                primaryForeground: 'oklch(0.969 0.016 293.756)',
                sidebarPrimary: 'oklch(0.541 0.281 293.009)',
                sidebarPrimaryForeground: 'oklch(0.969 0.016 293.756)',
                sidebarRing: 'oklch(0.541 0.281 293.009)',
                ring: 'oklch(0.541 0.281 293.009)',
            },
        },
    },
    {
        name: 'blue',
        label: 'Blue',
        preview: 'oklch(0.6 0.25 260)',
        cssClass: 'theme-blue',
        colors: {
            light: {
                primary: 'oklch(0.6 0.25 260)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.6 0.25 260)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.6 0.25 260)',
                ring: 'oklch(0.6 0.25 260)',
            },
            dark: {
                primary: 'oklch(0.55 0.28 260)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.55 0.28 260)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.55 0.28 260)',
                ring: 'oklch(0.55 0.28 260)',
            },
        },
    },
    {
        name: 'green',
        label: 'Green',
        preview: 'oklch(0.6 0.18 140)',
        cssClass: 'theme-green',
        colors: {
            light: {
                primary: 'oklch(0.6 0.18 140)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.6 0.18 140)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.6 0.18 140)',
                ring: 'oklch(0.6 0.18 140)',
            },
            dark: {
                primary: 'oklch(0.55 0.2 140)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.55 0.2 140)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.55 0.2 140)',
                ring: 'oklch(0.55 0.2 140)',
            },
        },
    },
    {
        name: 'orange',
        label: 'Orange',
        preview: 'oklch(0.65 0.2 50)',
        cssClass: 'theme-orange',
        colors: {
            light: {
                primary: 'oklch(0.65 0.2 50)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.65 0.2 50)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.65 0.2 50)',
                ring: 'oklch(0.65 0.2 50)',
            },
            dark: {
                primary: 'oklch(0.6 0.22 50)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.6 0.22 50)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.6 0.22 50)',
                ring: 'oklch(0.6 0.22 50)',
            },
        },
    },
    {
        name: 'red',
        label: 'Red',
        preview: 'oklch(0.62 0.24 25)',
        cssClass: 'theme-red',
        colors: {
            light: {
                primary: 'oklch(0.62 0.24 25)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.62 0.24 25)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.62 0.24 25)',
                ring: 'oklch(0.62 0.24 25)',
            },
            dark: {
                primary: 'oklch(0.57 0.26 25)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.57 0.26 25)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.57 0.26 25)',
                ring: 'oklch(0.57 0.26 25)',
            },
        },
    },
    {
        name: 'yellow',
        label: 'Yellow',
        preview: 'oklch(0.75 0.18 85)',
        cssClass: 'theme-yellow',
        colors: {
            light: {
                primary: 'oklch(0.75 0.18 85)',
                primaryForeground: 'oklch(0.2 0.02 85)',
                sidebarPrimary: 'oklch(0.75 0.18 85)',
                sidebarPrimaryForeground: 'oklch(0.2 0.02 85)',
                sidebarRing: 'oklch(0.75 0.18 85)',
                ring: 'oklch(0.75 0.18 85)',
            },
            dark: {
                primary: 'oklch(0.8 0.2 85)',
                primaryForeground: 'oklch(0.15 0.02 85)',
                sidebarPrimary: 'oklch(0.8 0.2 85)',
                sidebarPrimaryForeground: 'oklch(0.15 0.02 85)',
                sidebarRing: 'oklch(0.8 0.2 85)',
                ring: 'oklch(0.8 0.2 85)',
            },
        },
    },
    {
        name: 'purple',
        label: 'Purple',
        preview: 'oklch(0.58 0.24 320)',
        cssClass: 'theme-purple',
        colors: {
            light: {
                primary: 'oklch(0.58 0.24 320)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.58 0.24 320)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.58 0.24 320)',
                ring: 'oklch(0.58 0.24 320)',
            },
            dark: {
                primary: 'oklch(0.53 0.26 320)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.53 0.26 320)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.53 0.26 320)',
                ring: 'oklch(0.53 0.26 320)',
            },
        },
    },
    {
        name: 'slate',
        label: 'Slate',
        preview: 'oklch(0.25 0.01 220)',
        cssClass: 'theme-slate',
        colors: {
            light: {
                primary: 'oklch(0.25 0.01 220)',
                primaryForeground: 'oklch(1 0 0)',
                sidebarPrimary: 'oklch(0.25 0.01 220)',
                sidebarPrimaryForeground: 'oklch(1 0 0)',
                sidebarRing: 'oklch(0.25 0.01 220)',
                ring: 'oklch(0.25 0.01 220)',
            },
            dark: {
                primary: 'oklch(0.92 0.01 220)',
                primaryForeground: 'oklch(0.15 0.01 220)',
                sidebarPrimary: 'oklch(0.92 0.01 220)',
                sidebarPrimaryForeground: 'oklch(0.15 0.01 220)',
                sidebarRing: 'oklch(0.92 0.01 220)',
                ring: 'oklch(0.92 0.01 220)',
            },
        },
    },
];

// Default theme (Violet - current theme)
export const defaultColorTheme = colorThemes[0];

export function getColorTheme(name: string): ColorTheme | undefined {
    return colorThemes.find(theme => theme.name === name);
}

export function applyColorTheme(theme: ColorTheme, isDark: boolean = false) {
    const colors = isDark ? theme.colors.dark : theme.colors.light;
    const root = document.documentElement;

    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--sidebar-primary', colors.sidebarPrimary || colors.primary);
    root.style.setProperty('--sidebar-primary-foreground', colors.sidebarPrimaryForeground || colors.primaryForeground);
    root.style.setProperty('--sidebar-ring', colors.sidebarRing || colors.ring);
    root.style.setProperty('--ring', colors.ring);
}
