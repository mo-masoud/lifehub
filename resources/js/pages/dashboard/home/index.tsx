import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import SavingsStats from './savings-stats';

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

interface IndexProps {
    latestSnapshotTotals: LatestSnapshotTotals | null;
    topTransactions: TopTransactions;
    totalExpenses: TotalByPeriod;
    totalIncome: TotalByPeriod;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
];

export default function Index({ latestSnapshotTotals, topTransactions, totalExpenses, totalIncome }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.home')} />
            <SavingsStats
                latestSnapshotTotals={latestSnapshotTotals}
                topTransactions={topTransactions}
                totalExpenses={totalExpenses}
                totalIncome={totalIncome}
            />
        </AppLayout>
    );
}
