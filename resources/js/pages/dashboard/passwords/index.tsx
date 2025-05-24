import { Heading } from '@/components/dashboard/heading';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Password } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { ExternalLink, Eye, EyeOff, KeyRound, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent, useState } from 'react';

import { ActionCell } from '@/components/dashboard/action-cell';
import { CreateItem } from '@/components/dashboard/create-item';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { PasswordForm } from '@/pages/dashboard/passwords/password-form';

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
    const { passwords, filters } = usePage<{ passwords: Pagination<Password>; filters: { keyword?: string } }>().props;

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
            route('dashboard.passwords.index'),
            { keyword: e.target.value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const destroy = (id: string) => {
        router.delete(route('dashboard.passwords.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.passwords')} />
            <div className="mt-4 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <KeyRound className="text-primary size-5" />
                    <Heading title={__('general.passwords')} />
                </div>

                <CreateItem label={__('passwords.create_password')} FormComponent={PasswordForm} />
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
                        {passwords.data.length === 0 && <TableCaption>{__('passwords.no_passwords_founds')}</TableCaption>}
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">{__('fields.name')}</TableHead>
                                <TableHead className="text-start text-xs">{__('fields.username')}</TableHead>
                                <TableHead className="text-start text-xs">{__('fields.password')}</TableHead>
                                <TableHead className="text-start text-xs">{__('fields.url')}</TableHead>
                                <TableHead className="text-end text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                    <span className="sr-only">{__('words.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {passwords.data.map((password) => (
                                <TableRow key={password.id}>
                                    <TableCell className="text-start text-sm">{password.name}</TableCell>
                                    <TableCell className="text-start text-sm">
                                        <span className="cursor-pointer" onClick={() => copyToClipboard(password.username)}>
                                            {password.username}
                                        </span>
                                    </TableCell>
                                    <TableCell className="flex w-40 items-center gap-2 text-start text-sm">
                                        <span className="cursor-pointer" onClick={() => copyToClipboard(password.password)}>
                                            {showingPasswords.includes(password.id) ? password.password : '**************'}
                                        </span>
                                        <Button size="icon" variant="ghost" onClick={() => toggleShowPassword(password.id)}>
                                            {showingPasswords.includes(password.id) ? (
                                                <EyeOff className="size-4 text-red-300" />
                                            ) : (
                                                <Eye className="size-4 text-blue-400" />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-start text-sm">
                                        {password.url ? (
                                            <a href={password.url} target="_blank">
                                                <ExternalLink className="size-4 text-blue-500" />
                                            </a>
                                        ) : (
                                            'N\\A'
                                        )}
                                    </TableCell>
                                    <ActionCell
                                        updateLabel={__('savings.update_password')}
                                        item={{ password }}
                                        FormComponent={PasswordForm}
                                        onDestroy={destroy}
                                    />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <TablePagination pagination={passwords} />
            </div>
        </AppLayout>
    );
}
