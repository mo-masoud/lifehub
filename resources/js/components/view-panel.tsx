import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { FC } from 'react';

interface ViewPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
    value?: string;
    valueContent?: React.ReactNode;
    icon?: LucideIcon;
    iconClassName?: string;
    actions?: React.ReactNode;
}

export const ViewPanel: FC<ViewPanelProps> = ({ label, value, valueContent, actions, icon, iconClassName, ...props }) => {
    const hasValue = value || valueContent;

    if (!hasValue) {
        throw new Error('Value or valueContent is required');
    }

    const Icon = icon;
    const { className, ...rest } = props;
    return (
        <div className={cn('flex h-16 w-full items-center justify-between py-6', className)} {...rest}>
            <div className="text-primary/70 flex w-1/4 items-center gap-2">
                {Icon && <Icon className={cn('size-4', iconClassName)} />}
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex w-3/4 flex-1 items-center justify-between gap-1 pl-4">
                {valueContent || <p className="truncate text-sm font-bold italic">{value}</p>}
                {actions && <div className="flex items-center">{actions}</div>}
            </div>
        </div>
    );
};
