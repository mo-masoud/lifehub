import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

interface DateInputProps {
    value?: Date;
    onChange: (date?: Date) => void;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
}

export function DateInput({ value, onChange, placeholder, minDate, maxDate }: DateInputProps) {
    const [open, setOpen] = useState(false);
    const handleChange = (date: Date | undefined) => {
        onChange(date);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn('mt-1 flex w-full items-center pl-3 text-left font-normal', !value && 'text-muted-foreground')}
                >
                    {value ? format(value, 'PPP') : <span>{placeholder}</span>}
                    <CalendarIcon className="ml-auto size-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleChange}
                    className="w-full rounded-md border"
                    fromDate={minDate}
                    toDate={maxDate}
                />
            </PopoverContent>
        </Popover>
    );
}
