import Heading from '@/components/dashboard/heading';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { CreatePassword } from '@/pages/dashboard/passwords/create-password';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Password } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronsLeft, ChevronsRight, ExternalLink, Eye, EyeOff, KeyRound, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent, useState } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UpdatePassword } from '@/pages/dashboard/passwords/update-password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.password_manager'),
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

    const destroy = (id: number) => {
        router.delete(route('dashboard.passwords.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
            },
        });
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
                                    <TableCell className="flex items-center justify-end text-sm">
                                        <UpdatePassword password={password} />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="size-4 text-red-500" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{__('messages.delete_confirmation')}</AlertDialogTitle>
                                                    <AlertDialogDescription>{__('messages.caution_cant_undone')}</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{__('messages.cancel')}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className={buttonVariants({ variant: 'destructive' })}
                                                        onClick={() => destroy(password.id)}
                                                    >
                                                        {__('messages.delete')}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                            {__('messages.showing_pagination', {
                                from: passwords.from || 0,
                                to: passwords.to || 0,
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
