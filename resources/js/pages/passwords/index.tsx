import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Pagination, SharedData } from '@/types';
import { Password } from '@/types/models';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Passwords',
        href: '/passwords',
    },
];

interface PasswordsPageProps extends SharedData {
    passwords: Pagination<Password>;
}

export default function PasswordsPage() {
    const { passwords } = usePage<PasswordsPageProps>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Passwords" />
            <div>
                <pre>{JSON.stringify(passwords, null, 2)}</pre>
            </div>
        </AppLayout>
    );
}
