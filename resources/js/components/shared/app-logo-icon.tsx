import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('inline-flex size-8 items-center justify-center rounded-full bg-neutral-900 text-neutral-100', className)}>
            <Sparkles className="size-5" />
        </div>
    );
}
