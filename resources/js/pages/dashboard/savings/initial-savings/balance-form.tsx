import InputError from '@/components/dashboard/input-error';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Balance, BalanceType, StorageLocation } from '@/types/models';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
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
    const [openSelectLocation, setOpenSelectLocation] = useState(false);
    const [locations, setLocations] = useState<StorageLocation[]>([]);
    const [creatingNewStorage, setCreatingNewStorage] = useState(false);
    const [newLocation, setNewLocation] = useState('');
    const [newLocationError, setNewLocationError] = useState('');

    const { data, setData, post, patch, errors, processing, recentlySuccessful } = useForm<Required<BalanceForm>>({
        type: balance?.type || ('' as BalanceType),
        amount: balance?.amount || ('' as any),
        storage_location_id: balance?.storage_location?.id || ('' as any),
    });

    const fetchLocations = async () => {
        try {
            const response = await axios.get('/api/savings/storage-locations'); // adjust route as needed
            setLocations(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveNewLocation = async () => {
        if (!newLocation.trim()) return;
        try {
            const response = await axios.post('/api/savings/storage-locations', {
                name: newLocation,
            });
            const added = response.data;
            setLocations((prev) => [...prev, added]);
            setData('storage_location_id', String(added.id));
            setCreatingNewStorage(false);
            setNewLocation('');
            setNewLocationError('');
            setOpenSelectLocation(false);
        } catch (err: any) {
            setNewLocationError(err.response.data.message);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const selectedLocationName = locations.find((location) => location.id == data.storage_location_id)?.name || 'savings.storage_placeholder';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!balance) {
            post(route('dashboard.savings.initial.store'), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success(__('messages.created_successfully'));
                    onSave(data);
                },
            });
            return;
        }

        patch(route('dashboard.savings.initial.update', balance.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(__('messages.updated_successfully'));
                onSave(data);
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 p-4">
            <div className="grid gap-2">
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
                <Label htmlFor="storage_location_id" className="truncate">
                    {__('savings.storage')} <span className="mx-1 text-lg text-red-500">*</span>
                </Label>

                <Popover open={openSelectLocation} onOpenChange={setOpenSelectLocation}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openSelectLocation}
                            className={cn('mt-1 w-full justify-between', !data.storage_location_id && 'text-muted-foreground text-xs')}
                        >
                            {__(selectedLocationName)}
                            <ChevronsUpDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[567px] p-0">
                        <Command>
                            {creatingNewStorage ? (
                                <>
                                    <div className="flex items-center gap-2 px-3 py-2">
                                        <Input
                                            className="flex-1"
                                            value={newLocation}
                                            placeholder={__('savings.storage_name_placeholder')}
                                            onChange={(e) => setNewLocation(e.target.value)}
                                            autoFocus
                                        />
                                        <Button type="button" size="icon" variant="ghost" onClick={handleSaveNewLocation}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setCreatingNewStorage(false);
                                                setNewLocationError('');
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {newLocationError && <InputError className="mx-2 mt-0.5 mb-2 text-xs" message={newLocationError} />}
                                </>
                            ) : (
                                <Button variant="ghost" className="m-1 flex items-center justify-between" onClick={() => setCreatingNewStorage(true)}>
                                    <h6 className="text-muted-foreground px-2 text-xs">Choose from the list or create a new one</h6>
                                    <Plus />
                                </Button>
                            )}

                            <CommandSeparator />

                            <CommandList>
                                <CommandEmpty>No framework found.</CommandEmpty>
                                <CommandGroup>
                                    {locations.map((location) => (
                                        <CommandItem
                                            key={location.id}
                                            value={location.id}
                                            onSelect={() => {
                                                setData('storage_location_id', location.id);
                                                setOpenSelectLocation(false);
                                            }}
                                        >
                                            <Check
                                                className={cn('mr-2 h-4 w-4', data.storage_location_id == location.id ? 'opacity-100' : 'opacity-0')}
                                            />
                                            {__(location.name)}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
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
