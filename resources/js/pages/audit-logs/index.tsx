import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Passwords',
        href: '/passwords',
    },
    {
        title: 'Audit Logs',
        href: '/audit-logs',
    },
];

export default function AuditLogsIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Log" />

            <div className="flex h-full flex-col gap-4 rounded-md p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Audit Logs" description="Track and monitor password activities and security events." icon={FileText} />
                </div>
            </div>
        </AppLayout>
    );
}
