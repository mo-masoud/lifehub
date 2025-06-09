import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SmartRadioGroupProps {
    options: {
        label: string;
        value: string;
        icon: LucideIcon;
    }[];
    value: string;
    onChange: (value: string) => void;
}

export function SmartRadioGroup({ options, value, onChange }: SmartRadioGroupProps) {
    return (
        <div className="bg-accent inline-flex w-fit items-center gap-1 rounded-lg p-1">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'focus-visible:border-ring focus-visible:ring-ring/50 flex items-center rounded-md px-3.5 py-1.5 transition-colors focus-visible:ring-[3px]',
                        value === option.value
                            ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                    )}
                >
                    <option.icon className="size-4" />
                    <span className="ml-1.5 text-sm">{option.label}</span>
                </button>
            ))}
        </div>
    );
}
