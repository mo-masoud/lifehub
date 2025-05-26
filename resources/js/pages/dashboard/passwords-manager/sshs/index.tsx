import { Heading } from '@/components/dashboard/heading';
import { SSHsTable } from '@/components/passwords-manger/sshs-table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, Pagination } from '@/types';
import { SSH } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { Terminal } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { SSHForm } from './ssh-from';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
    {
        title: __('general.ssh_manager'),
        href: route('dashboard.sshs.index'),
    },
];

export default function Index() {
    const { sshs, filters } = usePage<{ sshs: Pagination<SSH>; filters: { keyword?: string } }>().props;
    const [keyword, setKeyword] = useState<string>(filters.keyword ?? '');

    const search = (e: ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);

        router.get(
            route('dashboard.sshs.index'),
            { keyword: e.target.value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.ssh_manager')} />
            <div className="mt-4 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Terminal className="text-primary size-5" />
                    <Heading title={__('general.ssh_manager')} />
                </div>
            </div>

            <div className="mt-4 px-4">
                <SSHsTable
                    sshs={sshs}
                    FormComponent={SSHForm}
                    showFolder={true}
                    searchValue={keyword}
                    onSearch={search}
                    showCreateButton={true}
                    searchPlaceholder={__('general.search')}
                />
            </div>
        </AppLayout>
    );
}
