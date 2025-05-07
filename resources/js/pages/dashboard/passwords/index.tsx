import Heading from '@/components/dashboard/heading';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Password } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { ExternalLink, Eye, EyeOff, FilePenLine, KeyRound, PlusCircle, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent, useState } from 'react';

import { TablePagination } from '@/components/dashboard/table-pagination';
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PasswordForm } from '@/pages/dashboard/passwords/password-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.password_manager'),
        href: route('dashboard.passwords.index'),
    },
];

export default function Index() {
    const { passwords, filters } = usePage<{ passwords: Pagination<Password>; filters: { keyword?: string } }>().props;

    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [showUpdateSheet, setShowUpdateSheet] = useState<string | number>();

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

                <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setShowCreateSheet(true)}>
                            <span>{__('messages.new')}</span>
                            <PlusCircle />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="min-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <SheetHeader>
                            <SheetTitle>{__('passwords.create_password')}</SheetTitle>
                            <SheetDescription className="sr-only"></SheetDescription>
                        </SheetHeader>

                        <PasswordForm onSave={() => setShowCreateSheet(false)} />
                    </SheetContent>
                </Sheet>
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
                                        <Sheet
                                            open={showUpdateSheet === password.id}
                                            onOpenChange={(isOpen) => {
                                                setShowUpdateSheet(isOpen ? password.id : undefined);
                                            }}
                                        >
                                            <SheetTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => setShowUpdateSheet(password.id)}>
                                                    <FilePenLine className="size-4 text-green-500" />
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent className="min-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                                                <SheetHeader>
                                                    <SheetTitle>{__('savings.update_password')}</SheetTitle>
                                                    <SheetDescription className="sr-only"></SheetDescription>
                                                </SheetHeader>

                                                <PasswordForm password={password} onSave={() => setShowUpdateSheet(undefined)} />
                                            </SheetContent>
                                        </Sheet>
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

                <TablePagination pagination={passwords} />
            </div>
        </AppLayout>
    );
}
