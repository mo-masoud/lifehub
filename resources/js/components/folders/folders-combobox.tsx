import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Folder } from '@/types/models';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { Check, ChevronsUpDown, FolderIcon, FolderOpen, Folders } from 'lucide-react';
import { FC, useState } from 'react';

interface FoldersComboboxProps {
    folders: Folder[];
    selectedFolder?: Folder | null;
}
export const FoldersCombobox: FC<FoldersComboboxProps> = ({ folders, selectedFolder }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<number | null | undefined>(selectedFolder?.id || undefined);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
                    <span className="flex items-center gap-2">
                        <FolderIcon className="opacity-70" />
                        {value ? folders.find((folder) => folder.id == value)?.name : 'Select folder...'}
                    </span>
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search folder..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No folders found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setValue(undefined);
                                    setOpen(false);
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <Folders className="opacity-70" />
                                    <span>All folders</span>
                                </span>
                                <Check className={cn('ml-auto', value === undefined ? 'opacity-100' : 'opacity-0')} />
                            </CommandItem>
                            <CommandItem
                                onSelect={() => {
                                    setValue(null);
                                    setOpen(false);
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <FolderOpen className="opacity-70" />
                                    <span>No folder</span>
                                </span>
                                <Check className={cn('ml-auto', value === null ? 'opacity-100' : 'opacity-0')} />
                            </CommandItem>
                            <CommandSeparator />
                            {folders.map((folder) => (
                                <CommandItem
                                    keywords={[folder.name]}
                                    key={folder.id}
                                    onSelect={() => {
                                        setValue(folder.id);
                                        setOpen(false);
                                    }}
                                >
                                    {folder.name}
                                    <Check className={cn('ml-auto', value === folder.id ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
