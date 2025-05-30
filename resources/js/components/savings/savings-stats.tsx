import { type LatestSnapshotTotals, type TopCategoriesByPeriod, type TopTransactions, type TotalByPeriod } from '@/types/dashboard';
import { SavingsGoal } from '@/types/models';
import { CurrentSavings } from './current-savings';
import { TopCategoriesExpenses } from './top-categories-expenses';
import { TopTransactions as TopTransactionsComponent } from './top-transactions';
import { TotalExpenses } from './total-expenses';
import { TotalIncome } from './total-income';

interface SavingsStatsProps {
    latestSnapshotTotals: LatestSnapshotTotals | null;
    topTransactions: TopTransactions;
    totalExpenses: TotalByPeriod;
    totalIncome: TotalByPeriod;
    topCategories: TopCategoriesByPeriod;
    savingsGoals?: SavingsGoal[];
}

export const SavingsStats = ({
    latestSnapshotTotals,
    topTransactions,
    totalExpenses,
    totalIncome,
    topCategories,
    savingsGoals = [],
}: SavingsStatsProps) => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Current Savings - First item on all screens */}
            <div className="h-full">
                {latestSnapshotTotals && (
                    <CurrentSavings
                        date={latestSnapshotTotals.date}
                        totalEgp={latestSnapshotTotals.total_egp}
                        totalUsd={latestSnapshotTotals.total_usd}
                        savingsGoals={savingsGoals}
                    />
                )}
            </div>

            {/* Top Transactions - Second item on mobile, first row second column on larger screens */}
            <div className="h-full">
                <TopTransactionsComponent transactions={topTransactions} />
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
                <TopCategoriesExpenses topCategories={topCategories} />
            </div>
        </div>
    );
};
