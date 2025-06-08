import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Folder } from '@/types/passwords';
import { useForm } from '@inertiajs/react';
import { PopoverTrigger } from '@radix-ui/react-popover';
import axios from 'axios';
import { Check, ChevronsUpDown, FolderIcon, FolderOpen, Folders, Loader, Plus, Save } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface FoldersComboboxProps {
    selectedFolder?: string;
    onSelectFolder: (folderId: string) => void;
    hideAllFolderOption?: boolean;
    canCreateFolder?: boolean;
}
export const FoldersCombobox: FC<FoldersComboboxProps> = ({
    selectedFolder,
    onSelectFolder,
    hideAllFolderOption = false,
    canCreateFolder = false,
}) => {
    const [open, setOpen] = useState(false);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [value, setValue] = useState<string | undefined>(selectedFolder);
    const trigger = useRef<HTMLButtonElement>(null);
    const [createFolder, setCreateFolder] = useState(false);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const { data, reset, setData, errors } = useForm({
        name: '',
    });

    const handleCreateFolder = () => {
        setProcessing(true);
        axios
            .post(route('api.v1.folders.store'), data)
            .then((res) => {
                setFolders([res.data.folder, ...folders]);
                setValue(res.data.folder.id.toString());
                onSelectFolder(res.data.folder.id.toString());
                setOpen(false);
                setCreateFolder(false);
                reset();
                toast.success(res.data.success);
            })
            .catch((err) => {
                toast.error(err.response.data.errors.name);
            })
            .finally(() => {
                setProcessing(false);
            });
    };

    const getFolders = () => {
        setLoading(true);
        axios
            .get(route('api.v1.folders.index'))
            .then((res) => {
                setFolders(res.data);
            })
            .catch((err) => {
                toast.error(err.response.data.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getFolders();
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button ref={trigger} variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    <span className="flex items-center gap-2">
                        <FolderIcon className="opacity-70" />
                        {value === 'all'
                            ? 'All folders'
                            : value === 'none'
                              ? 'No folder'
                              : folders.find((folder) => folder.id.toString() == value)?.name || (
                                    <span className="text-muted-foreground">Select folder...</span>
                                )}
                    </span>
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" side="bottom" style={{ width: trigger.current?.clientWidth }}>
                {loading ? (
                    <div className="flex min-h-20 items-center justify-center p-2">
                        <Loader className="text-muted-foreground animate-spin duration-1500" />
                    </div>
                ) : (
                    <Command>
                        <CommandInput placeholder="Search folder..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>No folders found.</CommandEmpty>
                            {canCreateFolder && (
                                <CommandGroup>
                                    <CommandItem onSelect={() => setCreateFolder(true)}>
                                        {createFolder ? (
                                            <div className="flex w-full items-center gap-2">
                                                <Input
                                                    placeholder="Enter folder name"
                                                    autoFocus={createFolder}
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className={cn(
                                                        errors.name &&
                                                            'border-destructive/70 ring-destructive/70 outline-destructive/70 focus-visible:ring-destructive/70',
                                                    )}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleCreateFolder();
                                                        }
                                                    }}
                                                />
                                                <Button variant="outline" size="icon" onClick={handleCreateFolder} disabled={processing}>
                                                    <Save />
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Plus className="opacity-70" />
                                                <span>Create folder</span>
                                            </span>
                                        )}
                                    </CommandItem>
                                </CommandGroup>
                            )}
                            <CommandGroup>
                                {!hideAllFolderOption && (
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
                                )}
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
                                {folders.length > 0 && <CommandSeparator className="my-1" />}
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
                )}
            </PopoverContent>
        </Popover>
    );
};
