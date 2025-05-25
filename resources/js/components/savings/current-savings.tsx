import { Button } from '@/components/ui/button';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { CalendarDays, HandCoins, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

interface CurrentSavingsProps {
    date: string;
    totalEgp: number;
    totalUsd: number;
}

export const CurrentSavings = ({ date, totalEgp, totalUsd }: CurrentSavingsProps) => {
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

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-2">
                    <div className="mr-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <HandCoins className="size-4" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{__('stats.current_savings')}</h3>
                </div>

                <Button size="icon" className="size-7" variant="outline" onClick={newSnapshot}>
                    <RefreshCcw className="size-4" />
                </Button>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-4 p-6 xl:gap-3 xl:p-5">
                {/* EGP Amount */}
                <div className="text-center">
                    <div className="mb-1 text-sm font-medium text-zinc-500 xl:mb-1 dark:text-zinc-400">EGP</div>
                    <div className="text-2xl font-bold text-amber-600 xl:text-3xl dark:text-amber-400">{formatNumber(Math.floor(totalEgp))} £</div>
                </div>

                {/* USD Amount */}
                <div className="text-center">
                    <div className="mb-1 text-sm font-medium text-zinc-500 xl:mb-1 dark:text-zinc-400">USD</div>
                    <div className="text-2xl font-bold text-green-600 xl:text-3xl dark:text-green-400">{formatNumber(Math.floor(totalUsd))} $</div>
                </div>

                {/* Date */}
                <div className="mt-2 flex items-center justify-center gap-1 xl:mt-2">
                    <CalendarDays className="text-primary size-4 xl:size-3" />
                    <span className="text-muted-foreground text-xs font-medium xl:text-xs">
                        {__('stats.as_of')} {date}
                    </span>
                </div>
            </div>
        </div>
    );
};
