import { SelectOrCreate } from '@/components/dashboard/select-or-create';
import { InputError } from '@/components/forms/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { StorageLocation, Transaction, TransactionCategory } from '@/types/models';
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
    source_location_id?: string;
    destination_location_id?: string;
    storage_location_id?: string;
    notes?: string;
    date?: string;
    transaction_category_id?: string;
};

export const TransactionForm = ({ transaction, onSave }: { transaction?: Transaction; onSave: (form: TransactionForm) => void }) => {
    const [locations, setLocations] = useState<StorageLocation[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);

    const { data, setData, post, patch, errors, processing, recentlySuccessful } = useForm<TransactionForm>({
        type: transaction?.type || '',
        amount: String(transaction?.amount || ''),
        direction: transaction?.direction || 'out',
        storage_location_id: transaction?.storage_location?.id?.toString() || '',
        source_location_id: transaction?.source_location_id?.toString() || '',
        destination_location_id: transaction?.destination_location_id?.toString() || '',
        notes: transaction?.notes || '',
        date: transaction?.date || new Date().toDateString(),
        transaction_category_id: transaction?.category?.id?.toString() || '',
    });

    const handleCreateCategory = async (name: string) => {
        const response = await axios.post(route('api.dashboard.savings.transaction-categories.index'), {
            name,
            direction: data.direction,
        });

        return response.data;
    };

    const fetchLocations = async () => {
        try {
            const response = await axios.get(route('api.dashboard.savings.storage-locations.index')); // adjust route as needed
            setLocations(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(route('api.dashboard.savings.transaction-categories.index')); // adjust route as needed
            setCategories(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLocations();
        fetchCategories();
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const method = transaction ? patch : post;
        const url = transaction ? route('dashboard.savings.transactions.update', transaction.id) : route('dashboard.savings.transactions.store');
        const message = transaction ? __('messages.updated_successfully') : __('messages.created_successfully');

        method(url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(message);
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
                            selected={data.date ? new Date(data.date) : undefined}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            onSelect={(date) => setData('date', date?.toDateString() || '')}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <InputError className="mt-1 text-xs" message={errors.date} />
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
                    onChange={(e) => setData('amount', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') as any)}
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
                        <Label htmlFor="source_location_id" className="truncate">
                            {__('savings.from_location')} <span className="mx-1 text-lg text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(value) => {
                                setData('source_location_id', value);
                            }}
                            value={data.source_location_id}
                        >
                            <SelectTrigger id="source_location_id" className="mt-1 w-full text-xs">
                                <SelectValue placeholder={__('savings.from_location_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((location) => (
                                    <SelectItem key={location.id} value={location.id.toString()}>
                                        {__(location.name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError className="mt-1 text-xs" message={errors.source_location_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="destination_location_id" className="truncate">
                            {__('savings.to_location')} <span className="mx-1 text-lg text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(value) => {
                                setData('destination_location_id', value);
                            }}
                            value={data.destination_location_id}
                        >
                            <SelectTrigger id="destination_location_id" className="mt-1 w-full text-xs">
                                <SelectValue placeholder={__('savings.to_location_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((location) => (
                                    <SelectItem key={location.id} value={location.id.toString()}>
                                        {__(location.name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError className="mt-1 text-xs" message={errors.destination_location_id} />
                    </div>
                </>
            )}

            {data.direction !== 'transfer' && (
                <div className="grid gap-2" id="transaction_category_id_container">
                    <Label htmlFor="transaction_category_id" className="truncate">
                        {__('savings.category')} <span className="mx-1 text-lg text-red-500">*</span>
                    </Label>

                    <SelectOrCreate
                        selectedOption={data.transaction_category_id}
                        placeholder={__('savings.category_placeholder')}
                        options={categories}
                        filter={(category) => category.direction === data.direction}
                        onCreate={(category) => {
                            setCategories((prev) => [...prev, category]);
                            setData('transaction_category_id', String(category.id));
                        }}
                        onChange={(category) => setData('transaction_category_id', category.id)}
                        create={handleCreateCategory}
                    />
                </div>
            )}

            {data.direction !== 'transfer' && (
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
            )}

            <div className="grid gap-2">
                <Label htmlFor="notes" className="truncate">
                    {__('savings.notes')}
                </Label>
                <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    className="mt-1 block w-full placeholder:text-xs"
                    placeholder={__('savings.notes_placeholder')}
                    autoComplete="off"
                />
                <InputError className="mt-1 text-xs" message={errors.notes} />
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
