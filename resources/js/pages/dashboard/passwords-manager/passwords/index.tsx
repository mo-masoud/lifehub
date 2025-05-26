import { Heading } from '@/components/dashboard/heading';
import { PasswordsTable } from '@/components/passwords-manger/passwords-table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Password } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { Key } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { PasswordForm } from './password-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
    {
        title: __('general.passwords'),
        href: route('dashboard.passwords.index'),
    },
];

export default function Index() {
    const { passwords, filters } = usePage<{ passwords: Pagination<Password>; filters: { keyword?: string; folder_id?: string } }>().props;
    const [keyword, setKeyword] = useState<string>(filters.keyword ?? '');
    const [folderId, setFolderId] = useState<string>(filters.folder_id ?? '');

    const search = (e: ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);

        router.get(
            route('dashboard.passwords.index'),
            { keyword: e.target.value, folder_id: folderId },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const filterByFolder = (folder_id: string) => {
        setFolderId(folder_id);

        router.get(
            route('dashboard.passwords.index'),
            { keyword, folder_id },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setKeyword('');
        setFolderId('');

        router.get(
            route('dashboard.passwords.index'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.passwords')} />
            <div className="mt-4 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Key className="text-primary size-5" />
                    <Heading title={__('general.passwords')} />
                </div>
            </div>

            <div className="mt-4 px-4">
                <PasswordsTable
                    passwords={passwords}
                    FormComponent={PasswordForm}
                    showFolder={true}
                    searchValue={keyword}
                    onSearch={search}
                    folderFilter={folderId}
                    onFolderFilter={filterByFolder}
                    showCreateButton={true}
                    searchPlaceholder={__('general.search')}
                />
            </div>
        </AppLayout>
    );
}
