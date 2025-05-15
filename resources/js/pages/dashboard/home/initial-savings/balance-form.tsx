import InputError from '@/components/dashboard/input-error';
import { SelectOrCreate } from '@/components/dashboard/select-or-create';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { __ } from '@/lib/i18n';
import { Balance, BalanceType, StorageLocation } from '@/types/models';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

type BalanceForm = {
    type: BalanceType;
    amount?: '';
    storage_location_id: string;
};

type BalanceFormProps = {
    balance?: Balance;
    onSave: (form: BalanceForm) => void;
};

const BALANCE_TYPES: BalanceType[] = ['USD', 'EGP', 'GOLD24', 'GOLD21'];

export const BalanceForm = ({ balance, onSave }: BalanceFormProps) => {
    const [locations, setLocations] = useState<StorageLocation[]>([]);

    const { data, setData, post, patch, errors, processing, recentlySuccessful } = useForm<Required<BalanceForm>>({
        type: balance?.type || ('' as BalanceType),
        amount: balance?.amount || ('' as any),
        storage_location_id: balance?.storage_location?.id || ('' as any),
    });

    const fetchLocations = async () => {
        try {
            const response = await axios.get(route('api.dashboard.savings.storage-locations.index'));
            setLocations(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateLocation = async (name: string) => {
        const response = await axios.post(route('api.dashboard.savings.storage-locations.store'), {
            name,
        });

        return response.data;
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const method = balance ? patch : post;
        const url = balance ? route('dashboard.savings.initial.update', balance.id) : route('dashboard.savings.initial.store');
        const message = balance ? __('messages.updated_successfully') : __('messages.created_successfully');

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
        <form onSubmit={submit} className="space-y-2 p-4">
            <div className="grid gap-1">
                <Label htmlFor="type" className="truncate">
                    {__('savings.type')} <span className="mx-1 text-lg text-red-500">*</span>
                </Label>
                <Select
                    onValueChange={(value) => {
                        setData('type', value as BalanceType);
                    }}
                    value={data.type}
                >
                    <SelectTrigger id="type" className="mt-1 w-full text-xs">
                        <SelectValue placeholder={__('savings.type_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {BALANCE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                                {__(`savings.${type}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError className="mt-1 text-xs" message={errors.type} />
            </div>

            <div className="grid gap-1">
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

            <div className="grid gap-1" id="storage_location_id_container">
                <Label htmlFor="storage_location_id" className="truncate">
                    {__('savings.storage')} <span className="mx-1 text-lg text-red-500">*</span>
                </Label>

                <SelectOrCreate
                    selectedOption={data.storage_location_id}
                    placeholder={__('savings.storage_placeholder')}
                    options={locations}
                    onCreate={(location) => {
                        setLocations((prev) => [...prev, location]);
                        setData('storage_location_id', String(location.id));
                    }}
                    onChange={(category) => setData('storage_location_id', category.id)}
                    create={handleCreateLocation}
                />
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
