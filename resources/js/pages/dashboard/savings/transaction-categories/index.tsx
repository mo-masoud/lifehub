import { ActionCell } from '@/components/dashboard/action-cell';
import { CreateItem } from '@/components/dashboard/create-item';
import { Heading } from '@/components/dashboard/heading';
import { ShowSavingsDirection } from '@/components/dashboard/show-savings-direction';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { TransactionCategoryForm } from '@/pages/dashboard/savings/transaction-categories/transaction-category-form';
import type { BreadcrumbItem, Pagination } from '@/types';
import { TransactionCategory } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
    {
        title: __('savings.transaction_categories'),
        href: route('dashboard.savings.transaction-categories.index'),
    },
];

const sortIcon = (column: string, currentOrder: string, currentDirection: string) => {
    if (currentOrder === column) {
        return currentDirection === 'asc' ? <ChevronUp className="inline-block h-4 w-4" /> : <ChevronDown className="inline-block h-4 w-4" />;
    }
    return null;
};

const handleSort = (column: string) => {
    const currentOrder = new URLSearchParams(window.location.search).get('order_by') || 'name';
    const currentDirection = new URLSearchParams(window.location.search).get('order_direction') || 'asc';

    const newDirection = currentOrder === column && currentDirection === 'asc' ? 'desc' : 'asc';

    router.get(route('dashboard.savings.transaction-categories.index'), {
        order_by: column,
        order_direction: newDirection,
    });
};

export default function TransactionCategories() {
    const { transactionCategories } = usePage<{ transactionCategories: Pagination<TransactionCategory> }>().props;

    const currentOrder = new URLSearchParams(window.location.search).get('order_by') || 'name';
    const currentDirection = new URLSearchParams(window.location.search).get('order_direction') || 'desc';

    const destroy = (id: string) => {
        router.delete(route('dashboard.savings.transaction-categories.destroy', id), {
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
            <Head title={__('savings.transaction_categories')} />

            <div className="mt-4 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Tag className="text-primary size-5" />
                    <Heading title={__('savings.transaction_categories')} />
                </div>

                <CreateItem label={__('savings.create_transaction_category')} FormComponent={TransactionCategoryForm} />
            </div>

            <div className="mt-4 px-4">
                <Card className="p-0 pb-2">
                    <Table>
                        {transactionCategories.data.length === 0 && <TableCaption>{__('savings.no_transaction_categories_found')}</TableCaption>}
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl"
                                    onClick={() => handleSort('name')}
                                >
                                    {__('fields.name')} {sortIcon('name', currentOrder, currentDirection)}
                                </TableHead>
                                <TableHead className="cursor-pointer text-start text-xs" onClick={() => handleSort('direction')}>
                                    {__('savings.direction')} {sortIcon('direction', currentOrder, currentDirection)}
                                </TableHead>
                                <TableHead className="cursor-pointer text-start text-xs" onClick={() => handleSort('total_amount')}>
                                    {__('savings.total')} {sortIcon('total_amount', currentOrder, currentDirection)}
                                </TableHead>
                                <TableHead className="cursor-pointer text-start text-xs" onClick={() => handleSort('total_year')}>
                                    {__('savings.total_year')} {sortIcon('total_year', currentOrder, currentDirection)}
                                </TableHead>
                                <TableHead className="cursor-pointer text-start text-xs" onClick={() => handleSort('total_month')}>
                                    {__('savings.total_month')} {sortIcon('total_month', currentOrder, currentDirection)}
                                </TableHead>
                                <TableHead className="cursor-pointer text-start text-xs" onClick={() => handleSort('total_week')}>
                                    {__('savings.total_week')} {sortIcon('total_week', currentOrder, currentDirection)}
                                </TableHead>
                                <TableHead className="text-end text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                    <span className="sr-only">{__('words.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionCategories.data.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="text-start text-sm">{__(category.name)}</TableCell>
                                    <TableCell className="text-start text-sm">
                                        <ShowSavingsDirection direction={category.direction} />
                                    </TableCell>
                                    <TableCell className="text-start text-sm">{formatNumber(category.total_amount || 0)}</TableCell>
                                    <TableCell className="text-start text-sm">{formatNumber(category.total_year || 0)}</TableCell>
                                    <TableCell className="text-start text-sm">{formatNumber(category.total_month || 0)}</TableCell>
                                    <TableCell className="text-start text-sm">{formatNumber(category.total_week || 0)}</TableCell>
                                    <ActionCell
                                        updateLabel={__('savings.update_transaction_category')}
                                        item={{ category }}
                                        FormComponent={TransactionCategoryForm}
                                        onDestroy={destroy}
                                    />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <TablePagination pagination={transactionCategories} />
            </div>
        </AppLayout>
    );
}
