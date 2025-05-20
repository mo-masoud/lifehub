import { Button } from '@/components/ui/button';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Aperture, PlusCircle } from 'lucide-react';
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
        <div className="bg-background overflow-hidden rounded-lg border shadow-xs">
            <div className="inline-flex w-full items-center justify-between border-b px-4 py-1">
                <h3 className="inline-flex items-center gap-2 text-sm font-bold">
                    <Aperture className="text-primary size-4" />
                    <span>{__('stats.current_savings')}</span>
                </h3>
                <Button size="icon" variant="ghost" onClick={newSnapshot}>
                    <PlusCircle className="text-primary stroke-3" />
                </Button>
            </div>
            <div className="p-4">
                <div className="flex flex-col gap-3">
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

                    <div className="mt-1 flex items-center">
                        <p className="inline-flex items-center gap-1">
                            <span className="text-sm">🗓️</span>{' '}
                            <span className="text-muted-foreground text-xs font-semibold">
                                {__('stats.as_of')} {date}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
