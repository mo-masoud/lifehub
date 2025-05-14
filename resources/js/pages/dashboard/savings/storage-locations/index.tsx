import { ActionCell } from '@/components/dashboard/action-cell';
import { CreateItem } from '@/components/dashboard/create-item';
import Heading from '@/components/dashboard/heading';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { StorageLocationForm } from '@/pages/dashboard/savings/storage-locations/storage-location-form';
import type { BreadcrumbItem, Pagination, SharedData } from '@/types';
import { StorageLocation } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { Archive } from 'lucide-react';
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

            <div className="mt-4 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Archive className="text-primary size-5" />
                    <Heading title={__('savings.storage_locations')} />
                </div>

                <CreateItem label={__('savings.create_storage_location')} FormComponent={StorageLocationForm} />
            </div>

            <div className="mt-4 px-4">
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
                                    <ActionCell
                                        updateLabel={__('savings.update_storage')}
                                        item={{ storage }}
                                        FormComponent={StorageLocationForm}
                                        onDestroy={destroy}
                                        canEdit={String(user.id) === String(storage.user_id)}
                                        canDelete={String(user.id) === String(storage.user_id)}
                                    />
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
