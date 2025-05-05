import Heading from '@/components/dashboard/heading';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Snapshot } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { Aperture, Eye, EyeOff, PlusCircle } from 'lucide-react';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('savings.snapshots'),
        href: route('dashboard.savings.snapshots.index'),
    },
];

export default function Snapshots() {
    const { snapshots } = usePage<{ snapshots: Pagination<Snapshot> }>().props;

    const [snapshotOpen, setSnapshotOpen] = useState<string | number>();

    const newSnapshot = () => {
        router.post(
            route('dashboard.savings.snapshots.store'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(__('messages.created_successfully'));
                },
                onError: () => {
                    toast.error(__('messages.something_went_wrong'));
                },
            },
        );
    };

    function renderChange(current: number, prev: number | null) {
        if (!prev || prev === 0) return null;

        const diff = current - prev;
        const percent = (diff / prev) * 100;

        if (percent === 0) return null;

        const isUp = diff > 0;

        return (
            <div className="flex items-center gap-1">
                <span className={isUp ? 'text-green-600' : 'text-red-600'}>{isUp ? '▲' : '▼'}</span>
                <span className={`rounded px-1 py-0.5 text-xs ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {Math.abs(percent).toFixed(2)}%
                </span>
            </div>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('savings.snapshots')} />

            <div className="mt-12 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Aperture className="mb-8 size-5" />
                    <Heading title={__('savings.snapshots')} />
                </div>

                <Button onClick={newSnapshot}>
                    <span>{__('messages.new')}</span>
                    <PlusCircle />
                </Button>
            </div>

            <div className="px-4">
                <Card className="p-0 pb-2">
                    <Table>
                        {snapshots.data.length === 0 && <TableCaption>{__('savings.no_snapshots_founds')}</TableCaption>}
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">{__('savings.date')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.usd_rate')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.gold24_price')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.gold21_price')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.total_egp')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.total_usd')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.changes')}</TableHead>
                                <TableHead className="text-end text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                    <span className="sr-only">{__('words.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {snapshots.data.map((snapshot, index) => {
                                const currentTotal = snapshot.total_egp;
                                const prev = snapshots.data[index + 1];
                                const prevTotal = prev?.total_egp ?? null;

                                let change = null;

                                if (prevTotal) {
                                    const diff = currentTotal - prevTotal;
                                    const percent = (diff / prevTotal) * 100;
                                    const isIncrease = diff > 0;

                                    change = (
                                        <span className={isIncrease ? 'text-green-600' : 'text-red-600'}>
                                            {isIncrease ? '▲' : '▼'} {Math.abs(percent).toFixed(2)}%
                                        </span>
                                    );

                                    if (percent === 0) change = null;
                                }

                                return (
                                    <Fragment key={snapshot.id}>
                                        <TableRow>
                                            <TableCell className="text-start text-sm">{snapshot.date}</TableCell>
                                            <TableCell className="text-start text-sm">{snapshot.usd_rate}</TableCell>
                                            <TableCell className="text-start text-sm">{formatNumber(snapshot.gold24_price)}</TableCell>
                                            <TableCell className="text-start text-sm">{formatNumber(snapshot.gold21_price)}</TableCell>
                                            <TableCell className="text-start text-sm font-semibold">
                                                <div className="flex items-center space-x-2">
                                                    <span>{renderChange(snapshot.total_egp, snapshots.data[index + 1]?.total_egp)}</span>
                                                    <span>{formatNumber(snapshot.total_egp)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-start text-sm font-semibold">
                                                <div className="flex items-center space-x-2">
                                                    <span>{renderChange(snapshot.total_usd, snapshots.data[index + 1]?.total_usd)}</span>
                                                    <span>{formatNumber(snapshot.total_usd)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-start text-sm">{change}</TableCell>
                                            <TableCell className="flex items-center justify-end text-sm">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => (snapshotOpen ? setSnapshotOpen(undefined) : setSnapshotOpen(snapshot.id))}
                                                >
                                                    {snapshotOpen == snapshot.id ? (
                                                        <EyeOff className="size-4 text-blue-300" />
                                                    ) : (
                                                        <Eye className="size-4 text-blue-500" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {snapshotOpen == snapshot.id && (
                                            <TableRow className="bg-muted/50">
                                                <TableCell colSpan={8}>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">
                                                                    {__('savings.snapshot_details')}
                                                                </TableHead>

                                                                <TableHead className="text-muted-foreground text-start text-xs">
                                                                    {__('savings.type')}
                                                                </TableHead>
                                                                <TableHead className="text-muted-foreground text-start text-xs">
                                                                    {__('savings.storage')}
                                                                </TableHead>
                                                                <TableHead className="text-muted-foreground text-start text-xs">
                                                                    {__('savings.amount')}
                                                                </TableHead>
                                                                <TableHead className="text-muted-foreground text-start text-xs">
                                                                    {__('savings.rate')}
                                                                </TableHead>
                                                                <TableHead className="text-muted-foreground text-end text-xs">
                                                                    {__('savings.EGP')}
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {snapshot.items.map((item) => (
                                                                <TableRow key={item.id}>
                                                                    <TableCell className="text-start text-xs"></TableCell>
                                                                    <TableCell className="text-start text-xs">{item.type}</TableCell>
                                                                    <TableCell className="text-start text-xs">
                                                                        {__(item.storage_location.name)}
                                                                    </TableCell>
                                                                    <TableCell className="text-start text-xs">{formatNumber(item.amount)}</TableCell>
                                                                    <TableCell className="text-start text-xs">{item.rate}</TableCell>
                                                                    <TableCell className="text-end text-xs font-semibold">
                                                                        {formatNumber(item.amount * item.rate)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>

                <TablePagination pagination={snapshots} />
            </div>
        </AppLayout>
    );
}
