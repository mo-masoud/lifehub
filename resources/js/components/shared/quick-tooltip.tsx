import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickTooltipProps {
    children: React.ReactNode;
    content: string;
    className?: string;
    asChild?: boolean;
}

export function QuickTooltip({ children, content, className, asChild }: QuickTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
            <TooltipContent className={className}>
                <p>{content}</p>
            </TooltipContent>
        </Tooltip>
    );
}
