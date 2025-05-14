import { ArrowDown, ArrowUp, Repeat } from 'lucide-react';

export const ShowSavingsDirection = ({ direction }: { direction: string }) => {
    if (direction === 'in') {
        return (
            <span className="inline-flex items-center gap-x-1 text-green-500">
                <ArrowDown className="size-4" />
                <span>{__('savings.in')} </span>
            </span>
        );
    }

    if (direction === 'out') {
        return (
            <span className="inline-flex items-center gap-x-1 text-red-500">
                <ArrowUp className="size-4" />
                <span>{__('savings.out')} </span>
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-x-1 text-blue-500">
            <Repeat className="size-4" />
            <span>{__('savings.transfer')} </span>
        </span>
    );
};
