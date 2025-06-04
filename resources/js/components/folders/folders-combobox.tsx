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
    selectedFolder?: string;
    onSelectFolder: (folderId: string) => void;
}
export const FoldersCombobox: FC<FoldersComboboxProps> = ({ folders, selectedFolder, onSelectFolder }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string>(selectedFolder || 'all');

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
                    <span className="flex items-center gap-2">
                        <FolderIcon className="opacity-70" />
                        {value === 'all'
                            ? 'All folders'
                            : value === 'none'
                              ? 'No folder'
                              : folders.find((folder) => folder.id.toString() == value)?.name || 'Select folder...'}
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
                                    setValue('all');
                                    onSelectFolder('all');
                                    setOpen(false);
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <Folders className="opacity-70" />
                                    <span>All folders</span>
                                </span>
                                <Check className={cn('ml-auto', value === 'all' ? 'opacity-100' : 'opacity-0')} />
                            </CommandItem>
                            <CommandItem
                                onSelect={() => {
                                    setValue('none');
                                    onSelectFolder('none');
                                    setOpen(false);
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <FolderOpen className="opacity-70" />
                                    <span>No folder</span>
                                </span>
                                <Check className={cn('ml-auto', value === 'none' ? 'opacity-100' : 'opacity-0')} />
                            </CommandItem>
                            <CommandSeparator />
                            {folders.map((folder) => (
                                <CommandItem
                                    keywords={[folder.name]}
                                    key={folder.id}
                                    onSelect={() => {
                                        setValue(folder.id.toString());
                                        onSelectFolder(folder.id.toString());
                                        setOpen(false);
                                    }}
                                >
                                    {folder.name}
                                    <Check className={cn('ml-auto', value === folder.id.toString() ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
