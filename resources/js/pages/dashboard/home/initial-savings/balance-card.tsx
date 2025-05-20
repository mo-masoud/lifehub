import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatNumber } from '@/lib/utils';
import { Balance } from '@/types/models';
import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { BalanceForm } from './balance-form';

export const BalanceCard = ({ balance }: { balance: Balance }) => {
    const [showForm, setShowForm] = useState(false);

    const destroy = (id: string) => {
        router.delete(route('dashboard.savings.initial.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
            },
        });
    };

    return (
        <Popover open={showForm} onOpenChange={setShowForm}>
            <PopoverTrigger asChild>
                <div
                    key={balance.id}
                    onClick={() => setShowForm(true)}
                    className="flex cursor-pointer items-center justify-between rounded-md border p-3 transition hover:shadow-sm"
                >
                    <div className="flex flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-primary text-sm font-bold">{__('savings.' + balance.type)}</span>
                            <span className="bg-muted-foreground size-1 rounded-full" />
                            <span className="text-muted-foreground text-xs font-semibold">{__(balance.storage_location.name)}</span>
                        </div>
                        <span className="text-foreground text-base font-semibold">{formatNumber(balance.amount)}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => destroy(balance.id)}
                        className="ltr:ml-1 rtl:mr-1"
                        aria-label={__('actions.delete')}
                    >
                        <Trash2 className="text-destructive size-4" />
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <BalanceForm
                    balance={balance}
                    onSave={() => {
                        setShowForm(false);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
};
