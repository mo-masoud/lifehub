import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { StorageLocation } from '@/types/models';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

export const FiltersFrom = ({ filters }: { filters: Record<string, any> }) => {
    const [locations, setLocations] = useState<StorageLocation[]>([]);

    const { data, setData, get, processing, reset } = useForm({
        min_date: filters.min_date,
        max_date: filters.max_date,
        direction: filters.direction,
        storage_location: filters.storage_location,
        type: filters.type,
        from_type: filters.fromType,
        min_amount: filters.minAmount,
        max_amount: filters.maxAmount,
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

        const queryParams = Object.entries(data)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        const url = route('dashboard.savings.transactions.index') + '?' + queryParams;

        get(url, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <form className="flex flex-col space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-3 gap-4">
                <Label htmlFor="min_date" className="mt-3 truncate">
                    {__('savings.min_date')}
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn('col-span-2 w-full justify-start text-left font-normal', !data.min_date && 'text-muted-foreground')}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {data.min_date ? format(data.min_date, 'PPP') : <span>{__('savings.date')}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={new Date(data.min_date)}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            onSelect={(date) => setData('min_date', date?.toDateString() || '')}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Label htmlFor="max_date" className="mt-3 truncate">
                    {__('savings.max_date')}
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn('col-span-2 w-full justify-start text-left font-normal', !data.max_date && 'text-muted-foreground')}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {data.max_date ? format(data.max_date, 'PPP') : <span>{__('savings.date')}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={new Date(data.max_date)}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            onSelect={(date) => setData('max_date', date?.toDateString() || '')}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <Label htmlFor="direction" className="mt-3 truncate">
                    {__('savings.direction')}
                </Label>
                <Select
                    onValueChange={(value) => {
                        setData('direction', value);
                    }}
                    value={data.direction}
                >
                    <SelectTrigger id="direction" className="col-span-2 mt-1 w-full text-xs">
                        <SelectValue placeholder={__('savings.direction_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {['in', 'out', 'transfer'].map((type) => (
                            <SelectItem key={type} value={type}>
                                {__(`savings.${type}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <Label htmlFor="type" className="mt-3 truncate">
                    {__('savings.type')}
                </Label>
                <Select
                    onValueChange={(value) => {
                        setData('type', value);
                    }}
                    value={data.type}
                >
                    <SelectTrigger id="type" className="col-span-2 mt-1 w-full text-xs">
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
            </div>
            <div className="grid grid-cols-3 gap-4">
                <Label htmlFor="from_type" className="mt-3 truncate">
                    {__('savings.from_type')}
                </Label>
                <Select
                    onValueChange={(value) => {
                        setData('from_type', value);
                    }}
                    value={data.from_type}
                >
                    <SelectTrigger id="from_type" className="col-span-2 mt-1 w-full text-xs">
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
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Label htmlFor="min_amount" className="mt-3 truncate">
                    {__('savings.min_amount')}
                </Label>
                <Input
                    id="min_amount"
                    value={data.min_amount || ''}
                    type="text"
                    onChange={(e) => setData('min_amount', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') as any)}
                    className="col-span-2 mt-1 block w-full placeholder:text-xs"
                    placeholder={__('savings.min_amount_placeholder')}
                    autoComplete="off"
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Label htmlFor="max_amount" className="mt-3 truncate">
                    {__('savings.max_amount')}
                </Label>
                <Input
                    id="max_amount"
                    value={data.max_amount || ''}
                    type="text"
                    onChange={(e) => setData('max_amount', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') as any)}
                    className="col-span-2 mt-1 block w-full placeholder:text-xs"
                    placeholder={__('savings.max_amount_placeholder')}
                    autoComplete="off"
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Label htmlFor="storage_location" className="mt-3 truncate">
                    {__('savings.storage')}
                </Label>

                <Select
                    onValueChange={(value) => {
                        setData('storage_location', value);
                    }}
                    value={data.storage_location}
                >
                    <SelectTrigger id="storage_location" className="col-span-2 mt-1 w-full text-xs">
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
            </div>

            <Separator />
            <div className="grid grid-cols-6 gap-4">
                <Button disabled={processing} className="col-span-5">
                    {__('messages.filter')}
                </Button>

                <Button
                    variant="ghost"
                    className="col-span-1"
                    size="icon"
                    onClick={() => reset('type', 'from_type', 'direction', 'min_amount', 'max_amount', 'min_date', 'max_date', 'storage_location')}
                >
                    <RotateCcw />
                </Button>
            </div>
        </form>
    );
};
