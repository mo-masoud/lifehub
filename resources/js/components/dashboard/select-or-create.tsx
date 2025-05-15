import InputError from '@/components/dashboard/input-error';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
    options: any[];
    selectedOption?: any;
    label?: string;
    placeholder?: string;
    onCreate: (value: any) => void;
    onChange: (value: any) => void;
    filter?: (option: any, index: number, array: any[]) => boolean;
    create: (name: string) => any;
}

export const SelectOrCreate = ({ options, selectedOption, label = 'name', placeholder, onCreate, onChange, filter, create }: Props) => {
    const triggerRef = useRef<HTMLButtonElement>(null);

    const [open, setOpen] = useState(false);
    const [creatingNewOption, setCreatingNewOption] = useState(false);
    const [newOption, setNewOption] = useState('');
    const [newOptionError, setNewOptionError] = useState('');

    const handleSaveNewOption = async () => {
        if (!newOption.trim()) return;
        try {
            const added = await create(newOption);

            onCreate(added);
            onChange(added);

            setCreatingNewOption(false);
            setNewOption('');
            setNewOptionError('');
            setOpen(false);
        } catch (err: any) {
            setNewOptionError(err.response.data.message);
        }
    };

    if (filter) {
        options = options.filter(filter);
    }

    const selectedOptionName = options.find((option) => option.id == selectedOption)?.[label] || placeholder;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={triggerRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('mt-1 w-full justify-between', !selectedOption && 'text-muted-foreground text-xs')}
                >
                    {__(selectedOptionName)}
                    <ChevronsUpDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0"
                style={{
                    width: typeof window !== 'undefined' ? `${triggerRef.current?.offsetWidth || 0}px` : 'auto',
                }}
            >
                <Command>
                    {creatingNewOption ? (
                        <>
                            <div className="flex items-center gap-2 px-3 py-2">
                                <Input
                                    className="flex-1"
                                    value={newOption}
                                    placeholder={__('fields.name')}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    autoFocus
                                />
                                <Button type="button" size="icon" variant="ghost" onClick={handleSaveNewOption}>
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                        setCreatingNewOption(false);
                                        setNewOptionError('');
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {newOptionError && <InputError className="mx-2 mt-0.5 mb-2 text-xs" message={newOptionError} />}
                        </>
                    ) : (
                        <Button variant="ghost" className="m-1 flex items-center justify-between" onClick={() => setCreatingNewOption(true)}>
                            <h6 className="text-muted-foreground truncate px-2 text-xs">{__('messages.choose_from_list_or_create_new')}</h6>
                            <Plus />
                        </Button>
                    )}

                    <CommandSeparator />

                    <CommandList>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.id}
                                    onSelect={() => {
                                        onChange(option);
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn('mr-2 h-4 w-4', selectedOption == option.id ? 'opacity-100' : 'opacity-0')} />
                                    {__(option.name)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
