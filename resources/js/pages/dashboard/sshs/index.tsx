import Heading from '@/components/dashboard/heading';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, Pagination } from '@/types';
import { SSH } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronsLeft, ChevronsRight, Computer, Eye, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';

import { ActionCell } from '@/components/dashboard/action-cell';
import { CreateItem } from '@/components/dashboard/create-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SSHForm } from '@/pages/dashboard/sshs/ssh-from';
import { ChangeEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.ssh_manager'),
        href: route('dashboard.sshs.index'),
    },
];

export default function Index() {
    const { sshs, filters } = usePage<{ sshs: Pagination<SSH>; filters: { keyword?: string } }>().props;

    const [showingPasswords, setShowingPasswords] = useState<number[]>([]);
    const [keyword, setKeyword] = useState<string>(filters.keyword ?? '');

    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                toast.success('Copied to clipboard');
            })
            .catch((err) => {
                console.error('Could not copy text: ', err);
            });
    };

    const toggleShowPassword = (id: number) => {
        if (showingPasswords.includes(id)) {
            setShowingPasswords(showingPasswords.filter((passwordId) => passwordId !== id));
        } else {
            setShowingPasswords([...showingPasswords, id]);
        }
    };

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

    const destroy = (id: string) => {
        router.delete(route('dashboard.sshs.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.ssh_manager')} />
            <div className="mt-4 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Computer className="text-primary size-5" />
                    <Heading title={__('general.ssh_manager')} />
                </div>

                <CreateItem label={__('ssh.create_ssh')} FormComponent={SSHForm} />
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
                        {sshs.data.length === 0 && <TableCaption>{__('ssh.no_sshs_founds')}</TableCaption>}
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">{__('fields.name')}</TableHead>
                                <TableHead className="text-start text-xs">{__('fields.username')}</TableHead>
                                <TableHead className="text-start text-xs">{__('fields.ip')}</TableHead>
                                <TableHead className="text-start text-xs">{__('ssh.prompt')}</TableHead>
                                <TableHead className="text-start text-xs">{__('fields.password')}</TableHead>
                                <TableHead className="text-end text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                    <span className="sr-only">{__('words.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sshs.data.map((ssh) => (
                                <TableRow key={ssh.id}>
                                    <TableCell className="text-start text-sm">{ssh.name}</TableCell>
                                    <TableCell className="text-start text-sm">
                                        <span className="cursor-pointer" onClick={() => copyToClipboard(ssh.username)}>
                                            {ssh.username}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-start text-sm">
                                        <span className="cursor-pointer" onClick={() => copyToClipboard(ssh.ip)}>
                                            {ssh.ip}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-start text-sm">
                                        <span className="cursor-pointer" onClick={() => copyToClipboard(ssh.prompt)}>
                                            {ssh.prompt}
                                        </span>
                                    </TableCell>
                                    <TableCell className="w-40 text-start text-sm">
                                        <span className="cursor-pointer ltr:mr-2 rtl:ml-2" onClick={() => copyToClipboard(ssh.password)}>
                                            {showingPasswords.includes(ssh.id) ? ssh.password : '**************'}
                                        </span>
                                        <Button size="icon" variant="ghost" onClick={() => toggleShowPassword(ssh.id)}>
                                            {showingPasswords.includes(ssh.id) ? (
                                                <EyeOff className="size-4 text-red-300" />
                                            ) : (
                                                <Eye className="size-4 text-blue-400" />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <ActionCell updateLabel={__('savings.update_ssh')} item={{ ssh }} FormComponent={SSHForm} onDestroy={destroy} />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                            {__('messages.showing_pagination', {
                                from: sshs.from || 0,
                                to: sshs.to || 0,
                                total: sshs.total,
                            })}
                        </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 rtl:flex-row-reverse">
                        <Button
                            size="icon"
                            variant="outline"
                            disabled={!sshs.links[0].url}
                            onClick={() => {
                                router.visit(sshs.links[0].url!);
                            }}
                        >
                            <ChevronsLeft />
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            disabled={!sshs.links[sshs.links.length - 1].url}
                            onClick={() => router.visit(sshs.links[sshs.links.length - 1].url!)}
                        >
                            <ChevronsRight />
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
