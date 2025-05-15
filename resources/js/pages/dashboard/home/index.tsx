import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { PriceRateFallback } from '@/pages/dashboard/home/forms/price-rate-fallback';
import { type BreadcrumbItem } from '@/types';
import type { Balance } from '@/types/models';
import { Head, usePage } from '@inertiajs/react';
import { InitialSavingsCard } from './initial-savings/initial-savings-card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
];

export default function Index() {
    const { fallback_rates, initial_savings, initial_savings_completed } = usePage<{
        fallback_rates: Record<string, any>;
        initial_savings: Balance[];
        initial_savings_completed: boolean;
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.home')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {!initial_savings_completed && <InitialSavingsCard initialSavings={initial_savings} />}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <PriceRateFallback {...fallback_rates} />
                </div>
            </div>
        </AppLayout>
    );
}
