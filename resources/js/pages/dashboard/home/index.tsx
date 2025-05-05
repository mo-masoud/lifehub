import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { PriceRateFallback } from '@/pages/dashboard/home/forms/price-rate-fallback';
import { TopTransactionStats } from '@/pages/dashboard/home/stats/top-transaction-stats';
import { TotalStats } from '@/pages/dashboard/home/stats/total-stats';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
];

export default function Index() {
    const { savingsStats, fallbackRates } = usePage<{ savingsStats: Record<string, any>; fallbackRates: Record<string, any> }>().props;

    const topTransactions = savingsStats.top_transactions;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.home')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3 2xl:grid-cols-4">
                    <TotalStats savingsStats={savingsStats} />

                    <TopTransactionStats stats={topTransactions.in} dir={'in'} currentMonth={savingsStats.current_month} />
                    <TopTransactionStats stats={topTransactions.out} dir={'out'} currentMonth={savingsStats.current_month} />
                    <TopTransactionStats stats={topTransactions.transfer} dir={'transfer'} currentMonth={savingsStats.current_month} />
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <PriceRateFallback {...fallbackRates} />
                </div>
                {/*<div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">*/}
                {/*    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />*/}
                {/*</div>*/}
            </div>
        </AppLayout>
    );
}
