import InputError from '@/components/dashboard/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { __ } from '@/lib/i18n';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Props {
    usd_rate_fallback?: string;
    gold24_rate_fallback?: string;
    gold21_rate_fallback?: string;
}

export const PriceRateFallback = ({ usd_rate_fallback, gold24_rate_fallback, gold21_rate_fallback }: Props) => {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        usd_rate_fallback: usd_rate_fallback || '',
        gold24_rate_fallback: gold24_rate_fallback || '',
        gold21_rate_fallback: gold21_rate_fallback || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('dashboard.settings.savings.rate-fallback.update'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(__('messages.updated_successfully'));
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{__('settings.price_rate_fallback')}</CardTitle>
                <CardDescription>{__('settings.price_rate_fallback_description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="flex flex-col gap-4" onSubmit={submit}>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="usd_rate_fallback" className="w-2/5 truncate">
                            {__('savings.usd_rate_fallback')}
                        </Label>
                        <Input
                            id="usd_rate_fallback"
                            value={data.usd_rate_fallback}
                            type="text"
                            onChange={(e) => setData('usd_rate_fallback', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') as any)}
                            className="placeholder:text-xs"
                            placeholder={__('savings.usd_rate_fallback_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.usd_rate_fallback} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="gold24_rate_fallback" className="w-2/5 truncate">
                            {__('savings.gold24_rate_fallback')}
                        </Label>
                        <Input
                            id="gold24_rate_fallback"
                            value={data.gold24_rate_fallback}
                            type="text"
                            onChange={(e) =>
                                setData('gold24_rate_fallback', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') as any)
                            }
                            className="placeholder:text-xs"
                            placeholder={__('savings.gold24_rate_fallback_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.gold24_rate_fallback} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="gold21_rate_fallback" className="w-2/5 truncate">
                            {__('savings.gold21_rate_fallback')}
                        </Label>
                        <Input
                            id="gold21_rate_fallback"
                            value={data.gold21_rate_fallback}
                            type="text"
                            onChange={(e) =>
                                setData('gold21_rate_fallback', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') as any)
                            }
                            className="placeholder:text-xs"
                            placeholder={__('savings.gold21_rate_fallback_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.gold21_rate_fallback} />
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
            </CardContent>
        </Card>
    );
};
