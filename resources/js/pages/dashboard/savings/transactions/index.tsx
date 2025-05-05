import Heading from '@/components/dashboard/heading';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { FiltersFrom } from '@/pages/dashboard/savings/transactions/filters-from';
import { TransactionForm } from '@/pages/dashboard/savings/transactions/transaction-form';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Transaction } from '@/types/models';
import { Head, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowLeftRight, ArrowUp, Filter, PlusCircle, Repeat } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('savings.transactions'),
        href: route('dashboard.savings.transactions.index'),
    },
];

const RenderTransactionDirection = ({ direction }: { direction: string }) => {
    if (direction === 'in') {
        return (
            <span className="inline-flex items-center gap-x-1 text-green-500">
                <ArrowDown className="size-4" />
                <span>{__('savings.in')} </span>
            </span>
        );
    }

    if (direction === 'out') {
        return (
            <span className="inline-flex items-center gap-x-1 text-red-500">
                <ArrowUp className="size-4" />
                <span>{__('savings.out')} </span>
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-x-1 text-blue-500">
            <Repeat className="size-4" />
            <span>{__('savings.transfer')} </span>
        </span>
    );
};

export default function Index() {
    const { transactions, filters } = usePage<{ transactions: Pagination<Transaction>; filters: Record<string, any> }>().props;

    const [showCreateSheet, setShowCreateSheet] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('savings.transactions')} />

            <div className="mt-12 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <ArrowLeftRight className="mb-8 size-5" />
                    <Heading title={__('savings.transactions')} />
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
                            <SheetTitle>{__('savings.create_transaction')}</SheetTitle>
                            <SheetDescription className="sr-only"></SheetDescription>
                        </SheetHeader>

                        <TransactionForm onSave={() => setShowCreateSheet(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="mb-2 flex items-center justify-end px-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Filter className="size-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px]">
                        <FiltersFrom filters={filters} />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="px-4">
                <Card className="p-0 pb-2">
                    <Table>
                        {transactions.data.length === 0 && <TableCaption>{__('savings.no_transactions_founds')}</TableCaption>}
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">{__('savings.date')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.amount')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.direction')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.type')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.storage')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.from_type')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.from_amount')}</TableHead>
                                <TableHead className="text-end text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">{__('savings.notes')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.map((tr) => (
                                <TableRow key={tr.id}>
                                    <TableCell className="text-start text-sm">{tr.date}</TableCell>
                                    <TableCell className="text-start text-sm">{tr.amount}</TableCell>
                                    <TableCell className="text-start text-sm">
                                        <RenderTransactionDirection direction={tr.direction} />
                                    </TableCell>
                                    <TableCell className="text-start text-sm">{tr.type}</TableCell>
                                    <TableCell className="text-start text-sm">{__(tr.storage_location.name)}</TableCell>
                                    <TableCell className="text-start text-sm">{tr.from_type}</TableCell>
                                    <TableCell className="text-start text-sm">{tr.from_amount}</TableCell>
                                    <TableCell className="text-end text-sm">{tr.notes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <TablePagination pagination={transactions} />
            </div>
        </AppLayout>
    );
}
