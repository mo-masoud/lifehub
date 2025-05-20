import { Button } from '@/components/ui/button';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Aperture } from 'lucide-react';
import { toast } from 'sonner';

interface CurrentSavingsProps {
    date: string;
    totalEgp: number;
    totalUsd: number;
}

export default function CurrentSavings({ date, totalEgp, totalUsd }: CurrentSavingsProps) {
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
        <div className="bg-background overflow-hidden rounded-lg border">
            <div className="inline-flex w-full items-center justify-between border-b px-4 py-1">
                <h3 className="text-sm font-bold">{__('stats.current_savings')}</h3>
                <Button size="icon" variant="ghost" onClick={newSnapshot}>
                    <Aperture className="text-primary" />
                </Button>
            </div>
            <div className="p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 rounded-md bg-amber-100 p-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full">
                            <span className="text-xl font-medium">🇪🇬</span>
                        </div>
                        <div className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{formatNumber(Math.floor(totalEgp))} £</div>
                    </div>

                    <div className="flex items-center gap-3 rounded-md bg-green-500 p-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full">
                            <span className="text-xl font-medium">🇺🇸</span>
                        </div>
                        <div className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{formatNumber(Math.floor(totalUsd))} $</div>
                    </div>

                    <div className="mt-1 flex items-center">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {__('stats.as_of')} {date}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
