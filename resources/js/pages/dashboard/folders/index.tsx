import { Heading } from '@/components/dashboard/heading';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Folder } from '@/types/models';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FolderOpen, Search } from 'lucide-react';
import { toast } from 'sonner';

import { ActionCell } from '@/components/dashboard/action-cell';
import { CreateItem } from '@/components/dashboard/create-item';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { Input } from '@/components/ui/input';
import { ChangeEvent, useState } from 'react';
import { FolderForm } from './folder-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
    {
        title: __('general.folders'),
        href: route('dashboard.folders.index'),
    },
];

export default function Index() {
    const { folders, filters } = usePage<{
        folders: Pagination<Folder>;
        filters: { keyword?: string };
    }>().props;

    const [keyword, setKeyword] = useState<string>(filters.keyword ?? '');

    const search = (e: ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);

        router.get(
            route('dashboard.folders.index'),
            { keyword: e.target.value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const destroy = (id: string) => {
        router.delete(route('dashboard.folders.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.folders')} />
            <div className="mt-4 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <FolderOpen className="text-primary size-5" />
                    <Heading title={__('general.folders')} />
                </div>

                <CreateItem label={__('messages.create_folder')} FormComponent={FolderForm} />
            </div>

            <div className="mt-4 px-4">
                <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="relative">
                        <Input placeholder={__('general.search')} className="pl-9" value={keyword} onChange={search} />
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="size-4" />
                        </span>
                    </div>
                </div>
                <Card className="mt-4 p-0 pb-2">
                    <Table>
                        {folders.data.length === 0 && <TableCaption>{__('messages.no_folders')}</TableCaption>}
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">{__('fields.name')}</TableHead>
                                <TableHead className="text-end text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                    <span className="sr-only">{__('words.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {folders.data.map((folder) => (
                                <TableRow key={folder.id}>
                                    <TableCell className="text-start text-sm">
                                        <Link href={route('dashboard.folders.show', folder.id)} className="font-bold text-blue-700">
                                            {folder.name}
                                        </Link>
                                    </TableCell>
                                    <ActionCell
                                        updateLabel={__('messages.update_folder')}
                                        item={{ folder }}
                                        FormComponent={FolderForm}
                                        onDestroy={destroy}
                                    />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <TablePagination pagination={folders} />
            </div>
        </AppLayout>
    );
}
