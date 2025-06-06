import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FC } from 'react';

interface QuickTooltipProps {
    children: React.ReactNode;
    content: string;
    className?: string;
    asChild?: boolean;
}

export const QuickTooltip: FC<QuickTooltipProps> = ({ children, content, className, asChild }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
            <TooltipContent className={className}>
                <p>{content}</p>
            </TooltipContent>
        </Tooltip>
    );
};
