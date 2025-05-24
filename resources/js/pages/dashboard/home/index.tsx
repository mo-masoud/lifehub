import { SavingsStats } from '@/components/savings';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type LatestSnapshotTotals, type TopTransactions, type TotalByPeriod } from '@/types/dashboard';
import { Balance } from '@/types/models';
import { Head, usePage } from '@inertiajs/react';
import { PriceRateFallback } from './forms/price-rate-fallback';
import { InitialSavingsCard } from './initial-savings/initial-savings-card';

interface IndexProps {
    latestSnapshotTotals?: LatestSnapshotTotals | null;
    topTransactions?: TopTransactions;
    totalExpenses?: TotalByPeriod;
    totalIncome?: TotalByPeriod;
    initialSavings?: Balance[];
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
    initialSavings,
    usdRateFallback,
    gold24RateFallback,
    gold21RateFallback,
}: IndexProps) {
    const { initial_savings_completed } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.home')} />
            <div className="space-y-4 divide-y p-4">
                <div className="pb-4">
                    {initial_savings_completed && (
                        <SavingsStats
                            latestSnapshotTotals={latestSnapshotTotals!}
                            topTransactions={topTransactions!}
                            totalExpenses={totalExpenses!}
                            totalIncome={totalIncome!}
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                    {!initial_savings_completed && <InitialSavingsCard initialSavings={initialSavings || []} />}

                    <PriceRateFallback
                        usdRateFallback={usdRateFallback}
                        gold24RateFallback={gold24RateFallback}
                        gold21RateFallback={gold21RateFallback}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
