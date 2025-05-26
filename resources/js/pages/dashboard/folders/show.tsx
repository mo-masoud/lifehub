import { Heading } from '@/components/dashboard/heading';
import { PasswordsTable } from '@/components/passwords-manger/passwords-table';
import { SSHsTable } from '@/components/passwords-manger/sshs-table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Folder, Password, SSH } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { FolderOpen, Key, Terminal } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { PasswordForm } from '../passwords-manager/passwords/password-form';
import { SSHForm } from '../passwords-manager/sshs/ssh-from';

export default function Show() {
    const { folder, passwords, sshs, filters } = usePage<{
        folder: Folder;
        passwords: Pagination<Password>;
        sshs: Pagination<SSH>;
        filters: { password_keyword?: string; ssh_keyword?: string };
    }>().props;

    const [passwordKeyword, setPasswordKeyword] = useState<string>(filters.password_keyword ?? '');
    const [sshKeyword, setSshKeyword] = useState<string>(filters.ssh_keyword ?? '');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('general.dashboard'),
            href: route('dashboard.home'),
        },
        {
            title: __('general.folders'),
            href: route('dashboard.folders.index'),
        },
        {
            title: folder.name,
            href: route('dashboard.folders.show', folder.id),
        },
    ];

    const searchPasswords = (e: ChangeEvent<HTMLInputElement>) => {
        setPasswordKeyword(e.target.value);

        router.get(
            route('dashboard.folders.show', folder.id),
            {
                password_keyword: e.target.value,
                ssh_keyword: sshKeyword,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const searchSSHs = (e: ChangeEvent<HTMLInputElement>) => {
        setSshKeyword(e.target.value);

        router.get(
            route('dashboard.folders.show', folder.id),
            {
                password_keyword: passwordKeyword,
                ssh_keyword: e.target.value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${__('general.folder')}: ${folder.name}`} />

            <div className="mt-4 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <FolderOpen className="text-primary size-5" />
                    <Heading title={folder.name} />
                </div>
            </div>

            {/* Passwords Section */}
            <div className="mt-6 px-4">
                <div className="mb-4 flex items-center gap-4">
                    <Key className="text-primary size-5" />
                    <h2 className="text-lg font-semibold">{__('general.passwords')}</h2>
                </div>

                <PasswordsTable
                    passwords={passwords}
                    FormComponent={PasswordForm}
                    showFolder={false}
                    searchValue={passwordKeyword}
                    onSearch={searchPasswords}
                    showCreateButton={true}
                    searchPlaceholder={`${__('general.search')} ${__('general.passwords')}`}
                    defaultFolder={folder}
                />
            </div>

            {/* SSH Section */}
            <div className="mt-8 px-4">
                <div className="mb-4 flex items-center gap-4">
                    <Terminal className="text-primary size-5" />
                    <h2 className="text-lg font-semibold">{__('general.ssh_manager')}</h2>
                </div>

                <SSHsTable
                    sshs={sshs}
                    FormComponent={SSHForm}
                    showFolder={false}
                    searchValue={sshKeyword}
                    onSearch={searchSSHs}
                    showCreateButton={true}
                    searchPlaceholder={`${__('general.search')} ${__('general.ssh_manager')}`}
                    defaultFolder={folder}
                />
            </div>
        </AppLayout>
    );
}
