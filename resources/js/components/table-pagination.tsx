import { cn } from '@/lib/utils';
import { Pagination } from '@/types';
import { BaseModel } from '@/types/base';
import { router } from '@inertiajs/react';
import { ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { FC } from 'react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface TablePaginationProps extends React.HTMLAttributes<HTMLDivElement> {
    pagination: Pagination<BaseModel>;
    currentFilters?: Record<string, string | number | boolean | undefined | null>;
    routeName?: string;
    perPage?: number;
    onPerPageChange?: (perPage: number) => void;
}

export const TablePagination: FC<TablePaginationProps> = ({
    pagination,
    currentFilters = {},
    routeName = 'passwords.index',
    perPage = 10,
    onPerPageChange,
    className,
}) => {
    const navigateToPage = (url: string | null) => {
        if (!url) return;

        // Extract page number from the URL
        const urlObj = new URL(url);
        const page = urlObj.searchParams.get('page');

        // Construct data with current filters and new page
        const data: Record<string, string | number | boolean | undefined | null> = {
            ...currentFilters,
            page: page ? parseInt(page) : 1,
        };

        // Remove undefined/null values
        Object.keys(data).forEach((key) => {
            if (data[key] === undefined || data[key] === null || data[key] === '') {
                delete data[key];
            }
        });

        router.visit(route(routeName, data), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handlePerPageChange = (newPerPage: number) => {
        if (onPerPageChange) {
            onPerPageChange(newPerPage);
        }
    };

    const perPageOptions = [10, 20, 30, 50];

    return (
        <div className={cn('flex items-center justify-between', className)}>
            <div className="text-muted-foreground text-sm">
                Showing {pagination.from} to {pagination.to} of {pagination.total} results.
            </div>

            <div className="hidden items-center gap-2 md:flex">
                <span className="text-muted-foreground text-sm">Items per page:</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1 rounded-md">
                            {perPage}
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {perPageOptions.map((option) => (
                            <DropdownMenuItem
                                key={option}
                                onClick={() => handlePerPageChange(option)}
                                className={cn(perPage === option && 'bg-accent text-accent-foreground')}
                            >
                                {option}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center justify-end gap-2">
                <Button
                    size="icon"
                    variant="outline"
                    disabled={!pagination.prev_page_url}
                    onClick={() => navigateToPage(pagination.prev_page_url || null)}
                >
                    <ChevronsLeft />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    disabled={!pagination.next_page_url}
                    onClick={() => navigateToPage(pagination.next_page_url || null)}
                >
                    <ChevronsRight />
                </Button>
            </div>
        </div>
    );
};
