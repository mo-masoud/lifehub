import { cn } from '@/lib/utils';
import { BrainCog } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('inline-flex size-6 items-center justify-center rounded-sm bg-neutral-900 text-neutral-100', className)}>
            <BrainCog className="size-4" />
        </div>
    );
}
