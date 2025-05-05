import InputError from '@/components/dashboard/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { StorageLocation } from '@/types/models';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

type TransactionForm = {
    type: string;
    amount: string;
    direction: string;
    from_type?: string;
    from_amount?: string;
    storage_location_id: string;
    notes?: string;
    date?: string;
};

export const TransactionForm = ({ onSave }: { onSave: (form: TransactionForm) => void }) => {
    const [locations, setLocations] = useState<StorageLocation[]>([]);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<Required<TransactionForm>>({
        type: '',
        amount: '',
        direction: 'in',
        storage_location_id: '',
        from_type: '',
        from_amount: '',
        notes: '',
        date: '',
    });

    const fetchLocations = async () => {
        try {
            const response = await axios.get('/api/savings/storage-locations'); // adjust route as needed
            setLocations(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('dashboard.savings.transactions.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(__('messages.created_successfully'));
                onSave(data);
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 p-4">
            <div className="grid gap-2">
                <Label htmlFor="date" className="truncate">
                    {__('savings.date')} <span className="mx-1 text-lg text-red-500">*</span>
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !data.date && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {data.date ? format(data.date, 'PPP') : <span>{__('savings.date')}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={new Date(data.date)}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            onSelect={(date) => setData('date', date?.toDateString() || '')}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <InputError className="mt-1 text-xs" message={errors.amount} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="type" className="truncate">
                    {__('savings.type')} <span className="mx-1 text-lg text-red-500">*</span>
                </Label>
                <Select
                    onValueChange={(value) => {
                        setData('type', value);
                    }}
                    value={data.type}
                >
                    <SelectTrigger id="type" className="mt-1 w-full text-xs">
                        <SelectValue placeholder={__('savings.type_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {['USD', 'EGP', 'GOLD24', 'GOLD21'].map((type) => (
                            <SelectItem key={type} value={type}>
                                {__(`savings.${type}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError className="mt-1 text-xs" message={errors.type} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="amount" className="truncate">
                    {__('savings.amount')} <span className="mx-1 text-lg text-red-500">*</span>
                </Label>
                <Input
                    id="amount"
                    value={data.amount}
                    type="text"
                    onChange={(e) => setData('amount', e.target.value.replace(/[^0-9]/g, '') as any)}
                    className="mt-1 block w-full placeholder:text-xs"
                    placeholder={__('savings.amount_placeholder')}
                    autoComplete="off"
                />
                <InputError className="mt-1 text-xs" message={errors.amount} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="direction" className="truncate">
                    {__('savings.direction')} <span className="mx-1 text-lg text-red-500">*</span>
                </Label>

                <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                    <button
                        type="button"
                        onClick={() => setData('direction', 'in')}
                        className={cn(
                            'flex w-full cursor-pointer items-center justify-center rounded-md px-3.5 py-1.5 text-green-500 transition-colors',
                            data.direction === 'in'
                                ? 'bg-white shadow-xs dark:bg-neutral-700'
                                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        <ArrowDown className="h-4 w-4 ltr:-ml-1 rtl:-mr-1" />
                        <span className="text-sm ltr:ml-1.5 rtl:mr-1.5">{__('savings.in')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setData('direction', 'out')}
                        className={cn(
                            'flex w-full cursor-pointer items-center justify-center rounded-md px-3.5 py-1.5 text-red-500 transition-colors',
                            data.direction === 'out'
                                ? 'bg-white shadow-xs dark:bg-neutral-700'
                                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        <ArrowUp className="h-4 w-4 ltr:-ml-1 rtl:-mr-1" />
                        <span className="text-sm ltr:ml-1.5 rtl:mr-1.5">{__('savings.out')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setData('direction', 'transfer')}
                        className={cn(
                            'flex w-full cursor-pointer items-center justify-center rounded-md px-3.5 py-1.5 text-blue-500 transition-colors',
                            data.direction === 'transfer'
                                ? 'bg-white shadow-xs dark:bg-neutral-700'
                                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        <Repeat className="h-4 w-4 ltr:-ml-1 rtl:-mr-1" />
                        <span className="text-sm ltr:ml-1.5 rtl:mr-1.5">{__('savings.transfer')}</span>
                    </button>
                </div>
                <InputError className="mt-1 text-xs" message={errors.direction} />
            </div>

            {data.direction === 'transfer' && (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="from_type" className="truncate">
                            {__('savings.from_type')} <span className="mx-1 text-lg text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(value) => {
                                setData('from_type', value);
                            }}
                            value={data.from_type}
                        >
                            <SelectTrigger id="from_type" className="mt-1 w-full text-xs">
                                <SelectValue placeholder={__('savings.from_type_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {['USD', 'EGP', 'GOLD24', 'GOLD21'].map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {__(`savings.${type}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError className="mt-1 text-xs" message={errors.type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="from_amount" className="truncate">
                            {__('savings.from_amount')} <span className="mx-1 text-lg text-red-500">*</span>
                        </Label>
                        <Input
                            id="from_amount"
                            value={data.from_amount}
                            type="text"
                            onChange={(e) => setData('from_amount', e.target.value.replace(/[^0-9]/g, '') as any)}
                            className="mt-1 block w-full placeholder:text-xs"
                            placeholder={__('savings.from_amount_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.amount} />
                    </div>
                </>
            )}

            <div className="grid gap-2">
                <Label htmlFor="storage_location_id" className="truncate">
                    {__('savings.storage')} <span className="mx-1 text-lg text-red-500">*</span>
                </Label>
                <Select
                    onValueChange={(value) => {
                        setData('storage_location_id', value);
                    }}
                    value={data.storage_location_id}
                >
                    <SelectTrigger id="storage_location_id" className="mt-1 w-full text-xs">
                        <SelectValue placeholder={__('savings.storage_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                                {__(location.name)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError className="mt-1 text-xs" message={errors.storage_location_id} />
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
    );
};
