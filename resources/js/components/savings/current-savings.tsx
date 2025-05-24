import { Button } from '@/components/ui/button';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { CalendarDays, HandCoins, PlusCircle } from 'lucide-react';
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
        <div className="bg-background flex h-full flex-col overflow-hidden rounded-lg border shadow-xs">
            <div className="flex w-full items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <HandCoins className="size-4" />
                    </span>
                    <h3 className="text-sm font-bold">{__('stats.current_savings')}</h3>
                </div>

                <Button size="icon" className="size-7" variant="outline" onClick={newSnapshot}>
                    <PlusCircle />
                </Button>
            </div>

            <div className="mt-2 flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3 rounded-md bg-amber-100 p-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full">
                        <span className="flex size-7 items-center justify-center rounded-full bg-amber-400 text-xl font-medium">🇪🇬</span>
                    </div>
                    <div className="text-lg font-semibold text-black">{formatNumber(Math.floor(totalEgp))} £</div>
                </div>

                <div className="flex items-center gap-3 rounded-md bg-green-100 p-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full">
                        <span className="flex size-7 items-center justify-center rounded-full bg-green-400 text-xl font-medium">🇺🇸</span>
                    </div>
                    <div className="text-lg font-semibold text-black">{formatNumber(Math.floor(totalUsd))} $</div>
                </div>

                <div className="mt-2 flex items-center">
                    <p className="inline-flex items-center gap-1">
                        <CalendarDays className="text-primary size-4" />
                        <span className="text-muted-foreground text-xs font-semibold">
                            {__('stats.as_of')} {date}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};
