import { StatCard } from '@/components/dashboard/state-card';
import { formatNumber } from '@/lib/utils';

export const TotalStats = ({ savingsStats }: { savingsStats: Record<string, any> }) => {
    const totalUSD = (savingsStats.total_usd as number).toFixed(2);

    const renderChangeValue = (value: number) => {
        if (value > 0) {
            return <span className="text-green-500">{value} % ▲</span>;
        } else if (value < 0) {
            return <span className="text-red-500">{value} % ▼</span>;
        }
        return `${value} %`;
    };

    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video justify-between overflow-auto rounded-xl border">
            <div className="absolute inset-0 grid size-full grid-cols-3">
                <StatCard label="Total (EGP)" value={formatNumber(savingsStats.total_egp as number)} />
                <StatCard label="Total (USD)" value={formatNumber(parseFloat(totalUSD))} />
                <div className="bg-card hover:bg-muted flex flex-col items-center justify-center border p-4 transition-colors duration-300 ease-out">
                    <div className="text-muted-foreground mb-1 truncate text-sm">Changes</div>
                    <div className="truncate text-sm font-semibold md:text-lg">{renderChangeValue(savingsStats.change_percent as number)}</div>
                </div>
                <StatCard label="Current month" value={savingsStats.current_month} />
                <StatCard label="Latest snapshot" value={savingsStats.latest_snapshot_date} />
                <StatCard label="Snapshots" value={savingsStats.snapshot_count} />
            </div>
        </div>
    );
};
