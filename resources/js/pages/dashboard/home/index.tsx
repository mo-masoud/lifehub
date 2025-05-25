import { SavingsStats } from '@/components/savings';
import { SavingsGoalNotifications } from '@/components/savings/savings-goal-notifications';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type LatestSnapshotTotals, type TopCategoriesByPeriod, type TopTransactions, type TotalByPeriod } from '@/types/dashboard';
import { Balance } from '@/types/models';
import { Head, usePage } from '@inertiajs/react';
import { PiggyBank, Settings, Wallet } from 'lucide-react';
import { PriceRateFallback } from './forms/price-rate-fallback';
import { InitialSavingsCard } from './initial-savings/initial-savings-card';

interface SavingsGoal {
    id: number;
    title: string;
    target_amount_usd: number;
    target_amount_egp: number;
    current_amount_usd: number;
    current_amount_egp: number;
    progress_percentage: number;
    severity: 'low' | 'medium' | 'high' | 'very-high';
    target_date: string | null;
    is_achieved: boolean;
    is_overdue: boolean;
    achieved_at: string | null;
    success_notification_dismissed: boolean;
    success_notification_shown_at: string | null;
}

interface IndexProps {
    latestSnapshotTotals?: LatestSnapshotTotals | null;
    topTransactions?: TopTransactions;
    totalExpenses?: TotalByPeriod;
    totalIncome?: TotalByPeriod;
    topCategories?: TopCategoriesByPeriod;
    initialSavings?: Balance[];
    savingsGoals?: SavingsGoal[];
    usdRateFallback?: string;
    gold24RateFallback?: string;
    gold21RateFallback?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
];

export default function Index({
    latestSnapshotTotals,
    topTransactions,
    totalExpenses,
    totalIncome,
    topCategories,
    initialSavings,
    savingsGoals = [],
    usdRateFallback,
    gold24RateFallback,
    gold21RateFallback,
}: IndexProps) {
    const { initial_savings_completed } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.home')} />
            <div className="space-y-8 p-4 2xl:space-y-6 2xl:px-12">
                {/* Savings Goals Notifications */}
                {initial_savings_completed && savingsGoals.length > 0 && <SavingsGoalNotifications goals={savingsGoals} />}

                {/* Savings Module Section */}
                <div className="space-y-6 2xl:space-y-4">
                    {/* Savings Stats Section */}
                    {initial_savings_completed && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <PiggyBank className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 2xl:text-lg dark:text-gray-100">
                                        {__('home_page.savings_overview_title')}
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{__('home_page.savings_module_description')}</p>
                                </div>
                            </div>
                            <SavingsStats
                                latestSnapshotTotals={latestSnapshotTotals!}
                                topTransactions={topTransactions!}
                                totalExpenses={totalExpenses!}
                                totalIncome={totalIncome!}
                                topCategories={topCategories!}
                                savingsGoals={savingsGoals}
                            />
                        </div>
                    )}

                    {/* Savings Setup Section */}
                    {!initial_savings_completed && (
                        <div className="space-y-4 2xl:space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-600 2xl:h-5 2xl:w-5 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Wallet className="h-4 w-4 2xl:h-3 2xl:w-3" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 2xl:text-base dark:text-gray-100">
                                        {__('home_page.savings_setup_title')}
                                    </h2>
                                    <p className="text-sm text-gray-600 2xl:text-xs dark:text-gray-400">
                                        {__('home_page.savings_setup_description')}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 2xl:gap-4">
                                <InitialSavingsCard initialSavings={initialSavings || []} />
                            </div>
                        </div>
                    )}

                    {/* Savings Configuration Section */}
                    <div className="space-y-4 2xl:space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-600 2xl:h-5 2xl:w-5 dark:bg-gray-800 dark:text-gray-400">
                                <Settings className="h-4 w-4 2xl:h-3 2xl:w-3" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 2xl:text-base dark:text-gray-100">
                                    {__('home_page.savings_settings_title')}
                                </h2>
                                <p className="text-sm text-gray-600 2xl:text-xs dark:text-gray-400">{__('home_page.savings_settings_description')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 2xl:gap-4">
                            <PriceRateFallback
                                usdRateFallback={usdRateFallback}
                                gold24RateFallback={gold24RateFallback}
                                gold21RateFallback={gold21RateFallback}
                            />
                        </div>
                    </div>
                </div>

                {/* Future Modules Placeholder */}
                {/* TODO: Add other module sections here (Passwords, SSH, etc.) */}
            </div>
        </AppLayout>
    );
}
