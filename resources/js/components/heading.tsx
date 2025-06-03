import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export default function Heading({
    title,
    description,
    iconClassName,
    ...props
}: {
    title: string;
    description?: string;
    icon?: LucideIcon | null;
    iconClassName?: string;
}) {
    return (
        <div className="space-y-0.5">
            <div className="flex items-center gap-2">
                {props.icon && <props.icon className={cn('size-5', iconClassName)} />}
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            </div>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
    );
}
