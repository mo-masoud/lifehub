import Heading from '@/components/dashboard/heading';
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
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { cn, formatNumber } from '@/lib/utils';
import { StorageLocationForm } from '@/pages/dashboard/savings/storage-locations/storage-location-form';
import type { BreadcrumbItem, Pagination, SharedData } from '@/types';
import { StorageLocation } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { Archive, FilePenLine, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('savings.storage_locations'),
        href: route('dashboard.savings.storage-locations.index'),
    },
];
export default function StorageLocations() {
    const { storageLocations } = usePage<{ storageLocations: Pagination<StorageLocation> }>().props;
    const {
        auth: { user },
    } = usePage<SharedData>().props;

    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [showUpdateSheet, setShowUpdateSheet] = useState<string | number>();

    const destroy = (id: string) => {
        router.delete(route('dashboard.savings.storage-locations.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
            },
            onError: (e) => {
                toast.error(e[0]);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('savings.storage_locations')} />

            <div className="mt-12 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Archive className="mb-8 size-5" />
                    <Heading title={__('savings.storage_locations')} />
                </div>

                <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setShowCreateSheet(true)} className="mb-8">
                            <span>{__('messages.new')}</span>
                            <PlusCircle />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="min-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <SheetHeader>
                            <SheetTitle>{__('savings.create_storage_location')}</SheetTitle>
                            <SheetDescription className="sr-only"></SheetDescription>
                        </SheetHeader>

                        <StorageLocationForm onSave={() => setShowCreateSheet(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="px-4">
                <Card className="p-0 pb-2">
                    <Table>
                        {storageLocations.data.length === 0 && <TableCaption>{__('savings.no_storage_locations_founds')}</TableCaption>}
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">{__('savings.storage')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.total_egp')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.usd')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.egp')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.gold24')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.gold21')}</TableHead>
                                <TableHead className="text-start text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                    <span className="sr-only">{__('words.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {storageLocations.data.map((storage) => (
                                <TableRow key={storage.id}>
                                    <TableCell className="text-start text-sm">{__(storage.name)}</TableCell>
                                    <TableCell className="text-start text-sm">{formatNumber(storage.total_egp || 0)}</TableCell>
                                    <TableCell className="text-start text-sm">{formatNumber(storage?.balances?.USD || 0)}</TableCell>
                                    <TableCell className="text-start text-sm">{formatNumber(storage?.balances?.EGP || 0)}</TableCell>
                                    <TableCell className="text-start text-sm">{formatNumber(storage?.balances?.GOLD24 || 0)}</TableCell>
                                    <TableCell className="text-start text-sm">{formatNumber(storage?.balances?.GOLD21 || 0)}</TableCell>
                                    <TableCell
                                        className={cn(
                                            'flex items-center justify-end text-sm',
                                            String(user.id) !== String(storage.user_id) && 'min-h-11',
                                        )}
                                    >
                                        {String(user.id) === String(storage.user_id) && (
                                            <>
                                                <Sheet
                                                    open={showUpdateSheet === storage.id}
                                                    onOpenChange={(isOpen) => {
                                                        setShowUpdateSheet(isOpen ? storage.id : undefined);
                                                    }}
                                                >
                                                    <SheetTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => setShowUpdateSheet(storage.id)}>
                                                            <FilePenLine className="size-4 text-green-500" />
                                                        </Button>
                                                    </SheetTrigger>
                                                    <SheetContent className="min-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                                                        <SheetHeader>
                                                            <SheetTitle>{__('savings.update_transaction')}</SheetTitle>
                                                            <SheetDescription className="sr-only"></SheetDescription>
                                                        </SheetHeader>

                                                        <StorageLocationForm storage={storage} onSave={() => setShowUpdateSheet(undefined)} />
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
                                                                onClick={() => destroy(storage.id)}
                                                            >
                                                                {__('messages.delete')}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <TablePagination pagination={storageLocations} />
            </div>
        </AppLayout>
    );
}
