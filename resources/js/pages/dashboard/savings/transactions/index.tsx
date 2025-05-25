import { ActionCell } from '@/components/dashboard/action-cell';
import { CreateItem } from '@/components/dashboard/create-item';
import { Heading } from '@/components/dashboard/heading';
import { ShowSavingsDirection } from '@/components/dashboard/show-savings-direction';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { FiltersFrom } from '@/pages/dashboard/savings/transactions/filters-from';
import { TransactionForm } from '@/pages/dashboard/savings/transactions/transaction-form';
import type { BreadcrumbItem, Pagination } from '@/types';
import { Transaction } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeftRight, Filter } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
    {
        title: __('savings.transactions'),
        href: route('dashboard.savings.transactions.index'),
    },
];

export default function Index() {
    const { transactions, filters } = usePage<{ transactions: Pagination<Transaction>; filters: Record<string, any> }>().props;

    const destroy = (id: string) => {
        router.delete(route('dashboard.savings.transactions.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('savings.transactions')} />

            <div className="mt-4 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <ArrowLeftRight className="text-primary size-5" />
                    <Heading title={__('savings.transactions')} />
                </div>

                <CreateItem label={__('savings.create_transaction')} FormComponent={TransactionForm} />
            </div>

            <div className="mt-4 mb-2 flex items-center justify-end px-4">
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
                                <TableHead className="text-start text-xs">{__('savings.category')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.notes')}</TableHead>
                                <TableHead className="text-start text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                    <span className="sr-only">{__('words.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="text-start text-sm">{transaction.date}</TableCell>
                                    <TableCell className="text-start text-sm">{transaction.amount}</TableCell>
                                    <TableCell className="text-start text-sm">
                                        <ShowSavingsDirection direction={transaction.direction} />
                                    </TableCell>
                                    <TableCell className="text-start text-sm">{transaction.type}</TableCell>
                                    <TableCell className="text-start text-sm">{__(transaction.storage_location.name)}</TableCell>
                                    <TableCell className="text-start text-sm">
                                        {transaction.direction !== 'transfer' && __(transaction.category?.name)}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-start text-xs">{transaction.notes || 'N/A'}</TableCell>
                                    <ActionCell
                                        updateLabel={__('savings.update_transaction')}
                                        item={{ transaction }}
                                        FormComponent={TransactionForm}
                                        onDestroy={destroy}
                                    />
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
