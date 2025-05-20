import { cn } from '@/lib/utils';

export const StatCard = ({ label, value, className }: { label: React.ReactNode; value: React.ReactNode; className?: string }) => (
    <div
        className={cn(
            'bg-card hover:bg-accent/5 flex flex-col items-center justify-center rounded-lg border p-3 shadow-sm transition-all duration-300 ease-out',
            className,
        )}
    >
        <div className="text-muted-foreground mb-1.5 truncate text-xs font-medium tracking-wider uppercase">{label}</div>
        <div className="truncate text-sm font-bold md:text-base lg:text-lg">{value}</div>
    </div>
);
