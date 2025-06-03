import { cn } from '@/lib/utils';
import { Pagination } from '@/types';
import { BaseModel } from '@/types/models';
import { router } from '@inertiajs/react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { FC } from 'react';
import { Button } from './ui/button';

interface TablePaginationProps extends React.HTMLAttributes<HTMLDivElement> {
    pagination: Pagination<BaseModel>;
}

export const TablePagination: FC<TablePaginationProps> = ({ pagination, className }) => {
    return (
        <div className={cn('flex items-center justify-between', className)}>
            <div className="text-muted-foreground text-sm">
                Showing {pagination.from} to {pagination.to} of {pagination.total} results.
            </div>
            <div></div>
            <div className="flex items-center justify-end gap-2">
                <Button
                    size="icon"
                    variant="outline"
                    disabled={!pagination.prev_page_url}
                    onClick={() => {
                        router.visit(pagination.prev_page_url!, {
                            preserveScroll: true,
                            preserveState: true,
                        });
                    }}
                >
                    <ChevronsLeft />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    disabled={!pagination.next_page_url}
                    onClick={() =>
                        router.visit(pagination.next_page_url!, {
                            preserveScroll: true,
                            preserveState: true,
                        })
                    }
                >
                    <ChevronsRight />
                </Button>
            </div>
        </div>
    );
};
