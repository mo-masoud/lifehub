import { ActionCell } from '@/components/dashboard/action-cell';
import Heading from '@/components/dashboard/heading';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { BalanceForm } from '@/pages/dashboard/savings/initial-savings/balance-form';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Balance } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { PlusCircle, Scale } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('savings.initial_balance'),
        href: route('dashboard.savings.initial.index'),
    },
];

export default function InitialSavings() {
    const { balances } = usePage<{ balances: Pagination<Balance> }>().props;

    const [showCreateSheet, setShowCreateSheet] = useState(false);

    const destroy = (id: string) => {
        router.delete(route('dashboard.savings.initial.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('savings.initial_balance')} />

            <div className="mt-12 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Scale className="mb-8 size-5" />
                    <Heading title={__('savings.initial_balance')} />
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
                            <SheetTitle>{__('savings.create_balance')}</SheetTitle>
                            <SheetDescription className="sr-only"></SheetDescription>
                        </SheetHeader>

                        <BalanceForm onSave={() => setShowCreateSheet(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="px-4">
                <Card className="p-0 pb-2">
                    <Table>
                        {balances.data.length === 0 && <TableCaption>{__('savings.no_balances_founds')}</TableCaption>}
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">{__('savings.type')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.amount')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.storage')}</TableHead>
                                <TableHead className="text-end text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                    <span className="sr-only">{__('words.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {balances.data.map((balance) => (
                                <TableRow key={balance.id}>
                                    <TableCell className="text-start text-sm">{balance.type}</TableCell>
                                    <TableCell className="text-start text-sm">{formatNumber(balance.amount)}</TableCell>
                                    <TableCell className="text-start text-sm">{__(balance.storage_location.name)}</TableCell>
                                    <ActionCell
                                        updateLabel={__('savings.update_balance')}
                                        item={{ balance }}
                                        FormComponent={BalanceForm}
                                        onDestroy={destroy}
                                    />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <TablePagination pagination={balances} />
            </div>
        </AppLayout>
    );
}
