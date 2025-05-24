import { Heading } from '@/components/dashboard/heading';
import { InputError } from '@/components/forms/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { __ } from '@/lib/i18n';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Props {
    usdRateFallback?: string;
    gold24RateFallback?: string;
    gold21RateFallback?: string;
}

export const PriceRateFallback = ({ usdRateFallback, gold24RateFallback, gold21RateFallback }: Props) => {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        usdRateFallback: usdRateFallback || '',
        gold24RateFallback: gold24RateFallback || '',
        gold21RateFallback: gold21RateFallback || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('dashboard.settings.savings.rate-fallback.update'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(__('messages.updated_successfully'));
            },
            onError: () => {
                toast.error(__('messages.error_occurred'));
            },
        });
    };

    return (
        <div className="bg-background rounded-lg border p-4 shadow-xs">
            <div>
                <Heading title={__('settings.price_rate_fallback')} />
                <p className="text-muted-foreground text-sm">{__('settings.price_rate_fallback_description')}</p>
            </div>
            <div className="mt-4">
                <form className="flex flex-col gap-4" onSubmit={submit}>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="usdRateFallback" className="w-2/5 truncate">
                            {__('savings.usd_rate_fallback')}
                        </Label>
                        <Input
                            id="usdRateFallback"
                            value={data.usdRateFallback}
                            type="text"
                            onChange={(e) => setData('usdRateFallback', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') as any)}
                            className="placeholder:text-xs"
                            placeholder={__('savings.usd_rate_fallback_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.usdRateFallback} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="gold24RateFallback" className="w-2/5 truncate">
                            {__('savings.gold24_rate_fallback')}
                        </Label>
                        <Input
                            id="gold24RateFallback"
                            value={data.gold24RateFallback}
                            type="text"
                            onChange={(e) => setData('gold24RateFallback', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') as any)}
                            className="placeholder:text-xs"
                            placeholder={__('savings.gold24_rate_fallback_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.gold24RateFallback} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="gold21RateFallback" className="w-2/5 truncate">
                            {__('savings.gold21_rate_fallback')}
                        </Label>
                        <Input
                            id="gold21RateFallback"
                            value={data.gold21RateFallback}
                            type="text"
                            onChange={(e) => setData('gold21RateFallback', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') as any)}
                            className="placeholder:text-xs"
                            placeholder={__('savings.gold21_rate_fallback_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.gold21RateFallback} />
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-4">
                        <Button disabled={processing}>{__('messages.save')}</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">{__('messages.saved')}</p>
                        </Transition>
                    </div>
                </form>
            </div>
        </div>
    );
};
