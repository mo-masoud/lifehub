import { ActionCell } from '@/components/dashboard/action-cell';
import { CreateItem } from '@/components/dashboard/create-item';
import Heading from '@/components/dashboard/heading';
import { ShowSavingsDirection } from '@/components/dashboard/show-savings-direction';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { TransactionCategoryForm } from '@/pages/dashboard/savings/transaction-categories/transaction-category-form';
import type { BreadcrumbItem, Pagination } from '@/types';
import { TransactionCategory } from '@/types/models';
import { Head, router, usePage } from '@inertiajs/react';
import { Tag } from 'lucide-react';
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

export default function TransactionCategories() {
    const { transactionCategories } = usePage<{ transactionCategories: Pagination<TransactionCategory> }>().props;

    const destroy = (id: string) => {
        router.delete(route('dashboard.savings.transaction-categories.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
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
                                <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">{__('fields.name')}</TableHead>
                                <TableHead className="text-start text-xs">{__('savings.direction')}</TableHead>
                                <TableHead className="text-end text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                    <span className="sr-only">{__('words.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionCategories.data.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="text-start text-sm">{category.name}</TableCell>
                                    <TableCell className="text-start text-sm">
                                        <ShowSavingsDirection direction={category.direction} />
                                    </TableCell>
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
