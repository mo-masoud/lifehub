import { useAppearance } from '@/hooks/use-appearance';
import { colorThemes } from '@/lib/color-themes';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ColorThemePickerProps {
    className?: string;
}

export const ColorThemePicker = ({ className }: ColorThemePickerProps) => {
    const { colorTheme, updateColorTheme } = useAppearance();

    return (
        <div className={cn('space-y-3', className)}>
            <div className="grid grid-cols-4 gap-3">
                {colorThemes.map((theme) => (
                    <button
                        key={theme.name}
                        onClick={() => updateColorTheme(theme)}
                        className={cn(
                            'group relative flex h-16 w-full flex-col items-center justify-center rounded-lg border-2 transition-all hover:scale-105',
                            colorTheme.name === theme.name ? 'border-ring ring-ring/20 ring-2' : 'border-border hover:border-ring/50',
                        )}
                        aria-label={`Select ${theme.label} theme`}
                    >
                        {/* Color preview circle */}
                        <div className="border-border/50 h-6 w-6 rounded-full border shadow-sm" style={{ backgroundColor: theme.preview }} />

                        {/* Theme name */}
                        <span className="text-muted-foreground group-hover:text-foreground mt-1 text-xs font-medium">{theme.label}</span>

                        {/* Selected indicator */}
                        {colorTheme.name === theme.name && (
                            <div className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full">
                                <Check className="h-3 w-3" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
