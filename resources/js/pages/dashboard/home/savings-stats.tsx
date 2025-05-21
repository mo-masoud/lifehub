import { __ } from '@/lib/i18n';
import { CurrentSavings, NoSnapshots, TopTransactions, TotalExpenses, TotalIncome } from './stats';

interface LatestSnapshotTotals {
    date: string;
    total_egp: number;
    total_usd: number;
}

interface Transaction {
    amount: number;
    date: string;
    category: string | null;
    category_id: number | null;
    notes: string | null;
    period: string;
}

interface TopTransactions {
    week: Transaction | null;
    month: Transaction | null;
    quarter: Transaction | null;
    year: Transaction | null;
}

interface TotalByPeriod {
    week: number;
    month: number;
    quarter: number;
    year: number;
}

interface SavingsStatsProps {
    latestSnapshotTotals: LatestSnapshotTotals | null;
    topTransactions: TopTransactions;
    totalExpenses: TotalByPeriod;
    totalIncome: TotalByPeriod;
}

export default function SavingsStats({ latestSnapshotTotals, topTransactions, totalExpenses, totalIncome }: SavingsStatsProps) {
    return (
        <div className="p-4">
            {/* Main Stats Grid - Using CSS Grid for precise layout control */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                {/* Current Savings - First item on all screens */}
                <div className="h-full">
                    {latestSnapshotTotals ? (
                        <CurrentSavings
                            date={latestSnapshotTotals.date}
                            totalEgp={latestSnapshotTotals.total_egp}
                            totalUsd={latestSnapshotTotals.total_usd}
                        />
                    ) : (
                        <NoSnapshots />
                    )}
                </div>

                {/* Top Transactions - Second item on mobile, first row second column on larger screens */}
                <div className="h-full">
                    <TopTransactions transactions={topTransactions} />
                </div>

                {/* Total Expenses - Third item on mobile, second row first column on larger screens */}
                <div className="h-full sm:row-start-2">
                    <TotalExpenses expenses={totalExpenses} />
                </div>

                {/* Total Income - Fourth item on mobile, second row second column on larger screens */}
                <div className="h-full sm:row-start-2">
                    <TotalIncome income={totalIncome} />
                </div>

                {/* Top Categories Expenses - Fifth item on mobile (spans 2 rows on mobile),
                    Third row spanning 2 columns on tablet,
                    First column spanning 2 rows on desktop */}
                <div className="col-span-1 row-span-2 h-full sm:col-span-2 sm:row-start-3 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1">
                    <div className="flex h-full flex-col rounded-lg border bg-white shadow-xs dark:bg-zinc-950">
                        <div className="flex items-center border-b px-4 py-2">
                            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{__('stats.top_categories_expenses')}</h3>
                        </div>
                        <div className="flex flex-grow items-center justify-center p-4">
                            <p className="text-sm text-zinc-500">{__('stats.coming_soon')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
