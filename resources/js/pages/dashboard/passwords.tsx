import Heading from '@/components/dashboard/heading';
import { CreatePassword } from '@/components/dashboard/passwords/create-password';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Password } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronsLeft, ChevronsRight, ExternalLink, Eye, EyeOff, FilePenLine, KeyRound, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.password_manager'),
        href: route('dashboard.passwords.index'),
    },
];

export default function Passwords() {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('general.password_manager')} />
            <div className="mt-12 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <KeyRound className="mb-8 size-5" />
                    <Heading title={__('general.password_manager')} />
                </div>

                <CreatePassword />
            </div>

            <div className="px-4">
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
                                    <TableHead className="text-start text-sm">{password.name}</TableHead>
                                    <TableHead className="text-start text-sm">
                                        <span className="cursor-pointer" onClick={() => copyToClipboard(password.username)}>
                                            {password.username}
                                        </span>
                                    </TableHead>
                                    <TableHead className="flex w-40 items-center gap-2 text-start text-sm">
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
                                    </TableHead>
                                    <TableHead className="text-start text-sm">
                                        {password.url ? (
                                            <a href={password.url} target="_blank">
                                                <ExternalLink className="size-4 text-blue-500" />
                                            </a>
                                        ) : (
                                            'N\\A'
                                        )}
                                    </TableHead>
                                    <TableHead className="flex items-center justify-end text-sm">
                                        <Button variant="ghost" size="icon">
                                            <FilePenLine className="size-4 text-green-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="size-4 text-red-500" />
                                        </Button>
                                    </TableHead>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                            {__('messages.showing_pagination', {
                                from: passwords.from,
                                to: passwords.to,
                                total: passwords.total,
                            })}
                        </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 rtl:flex-row-reverse">
                        <Button
                            size="icon"
                            variant="outline"
                            disabled={!passwords.links[0].url}
                            onClick={() => {
                                router.visit(passwords.links[0].url!);
                            }}
                        >
                            <ChevronsLeft />
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            disabled={!passwords.links[passwords.links.length - 1].url}
                            onClick={() => router.visit(passwords.links[passwords.links.length - 1].url!)}
                        >
                            <ChevronsRight />
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
