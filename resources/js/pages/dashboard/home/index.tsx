import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CurrentSavings, NoSnapshots } from './stats';

interface LatestSnapshotTotals {
    date: string;
    total_egp: number;
    total_usd: number;
}

interface IndexProps {
    latestSnapshotTotals: LatestSnapshotTotals | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
];

export default function Index({ latestSnapshotTotals }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.home')} />

            <div className="grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
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
        </AppLayout>
    );
}
