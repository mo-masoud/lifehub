import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { PriceRateFallback } from '@/pages/dashboard/home/forms/price-rate-fallback';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
];

export default function Index() {
    const { fallbackRates } = usePage<{ savingsStats: Record<string, any>; fallbackRates: Record<string, any> }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.home')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <PriceRateFallback {...fallbackRates} />
                </div>
            </div>
        </AppLayout>
    );
}
