import { cn } from '@/lib/utils';
import { HeartHandshake } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('relative size-12 rounded-md bg-gradient-to-br from-violet-600 to-cyan-600 text-white shadow', className)}>
            <HeartHandshake className="absolute top-1/2 right-1/2 size-2/3 translate-x-1/2 -translate-y-1/2" />
        </div>
    );
}
