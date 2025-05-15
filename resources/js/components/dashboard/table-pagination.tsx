import { Button } from '@/components/ui/button';
import { __ } from '@/lib/i18n';
import { Pagination } from '@/types';
import { router } from '@inertiajs/react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

export const TablePagination = ({ pagination }: { pagination: Pagination<any> }) => {
    return (
        <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                    {__('messages.showing_pagination', {
                        from: pagination.from || 0,
                        to: pagination.to || 0,
                        total: pagination.total,
                    })}
                </span>
            </div>
            <div className="flex items-center justify-end gap-2 rtl:flex-row-reverse">
                <Button
                    size="icon"
                    variant="outline"
                    disabled={!pagination.links[0].url}
                    onClick={() => {
                        router.visit(pagination.links[0].url!, {
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
                    disabled={!pagination.links[pagination.links.length - 1].url}
                    onClick={() =>
                        router.visit(pagination.links[pagination.links.length - 1].url!, {
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
