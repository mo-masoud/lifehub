import { ExpiredPasswordsList } from '@/components/features/dashboard/expired-passwords-list';
import { ExpiringPasswordsList } from '@/components/features/dashboard/expiring-passwords-list';
import { RecentPasswordsList } from '@/components/features/dashboard/recent-passwords-list';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { DashboardPageProps } from '@/types/dashboard';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { recentPasswords, expiringPasswords, expiredPasswords } = usePage<DashboardPageProps>().props;

    // Check if sections should be visible
    const hasExpiringPasswords = expiringPasswords.length > 0;
    const hasExpiredPasswords = expiredPasswords.length > 0;
    const hasSecondRow = hasExpiringPasswords || hasExpiredPasswords;

    // Determine grid columns for second row
    const secondRowGridClass = hasExpiringPasswords && hasExpiredPasswords ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* First Row: Recently Used (Full Width) */}
                <RecentPasswordsList passwords={recentPasswords} />

                {/* Second Row: Expiring & Expired (Conditional) */}
                {hasSecondRow && (
                    <div className={cn('grid gap-6 lg:gap-4', secondRowGridClass)}>
                        {hasExpiringPasswords && <ExpiringPasswordsList passwords={expiringPasswords} />}

                        {hasExpiredPasswords && <ExpiredPasswordsList passwords={expiredPasswords} />}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
