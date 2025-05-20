import Heading from '@/components/dashboard/heading';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Balance } from '@/types/models';
import { router } from '@inertiajs/react';
import { Plus, Scale, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { BalanceCard } from './balance-card';
import { BalanceForm } from './balance-form';

export const InitialSavingsCard = ({ initialSavings }: { initialSavings: Balance[] }) => {
    const [creatingNew, setCreatingNew] = useState(false);

    const complete = () => {
        router.post(
            route('dashboard.savings.initial.complete'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(__('savings.initial_savings_completed'));
                },
            },
        );
    };

    return (
        <div className="gap-4 p-4">
            <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-4 px-0">
                    <Scale className="text-primary size-5" />
                    <Heading title={__('savings.initial_balance')} />
                </div>

                <Popover open={creatingNew} onOpenChange={setCreatingNew}>
                    <PopoverTrigger asChild>
                        <Button onClick={() => setCreatingNew(true)} variant="outline">
                            <span>{__('messages.new')}</span>
                            <Plus className="ltr:ml-1 rtl:mr-1" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <BalanceForm
                            onSave={() => {
                                setCreatingNew(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {initialSavings.length === 0 ? (
                    <div className="text-muted-foreground col-span-full py-6 text-center text-sm">{__('savings.no_balances_founds')}</div>
                ) : (
                    initialSavings.map((balance) => <BalanceCard key={balance.id} balance={balance} />)
                )}
            </div>

            {initialSavings.length > 0 && (
                <div className="mt-4 flex flex-col items-start justify-center gap-4">
                    <p className="text-muted-foreground inline-flex items-center gap-2 text-xs font-semibold">
                        <TriangleAlert className="size-5 text-yellow-500" />
                        <span>{__('savings.save_initial_savings_warning')}</span>
                    </p>
                    <Button onClick={complete}>
                        <span>{__('savings.save_initial_savings')}</span>
                    </Button>
                </div>
            )}
        </div>
    );
};
