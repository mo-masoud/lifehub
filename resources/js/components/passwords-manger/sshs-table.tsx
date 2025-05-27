import { ActionCell } from '@/components/dashboard/action-cell';
import { CreateItem } from '@/components/dashboard/create-item';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { __ } from '@/lib/i18n';
import type { Pagination } from '@/types';
import { Folder, SSH } from '@/types/models';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Eye, EyeOff, Search } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SSHsTableProps {
    sshs: Pagination<SSH>;
    FormComponent: React.FC<any>;
    showFolder?: boolean;
    searchValue?: string;
    onSearch?: (e: ChangeEvent<HTMLInputElement>) => void;
    folderFilter?: string;
    onFolderFilter?: (folderId: string) => void;
    onResetFilters?: () => void;
    showCreateButton?: boolean;
    searchPlaceholder?: string;
    defaultFolder?: Folder;
}

export function SSHsTable({
    sshs,
    FormComponent,
    showFolder = true,
    searchValue = '',
    onSearch,
    folderFilter = '',
    onFolderFilter,
    showCreateButton = true,
    searchPlaceholder,
    defaultFolder,
}: SSHsTableProps) {
    const [showingPasswords, setShowingPasswords] = useState<number[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await axios.get(route('api.dashboard.folders.index'));
                setFolders(response.data);
            } catch (err) {
                console.error('Error fetching folders:', err);
            }
        };

        if (onFolderFilter) {
            fetchFolders();
        }
    }, [onFolderFilter]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                toast.success('Copied to clipboard');
            })
            .catch((err) => {
                console.error('Could not copy text: ', err);
            });
    };

    const toggleShowPassword = (id: number) => {
        if (showingPasswords.includes(id)) {
            setShowingPasswords(showingPasswords.filter((passwordId) => passwordId !== id));
        } else {
            setShowingPasswords([...showingPasswords, id]);
        }
    };

    const destroy = (id: string) => {
        router.delete(route('dashboard.sshs.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
            },
        });
    };

    const handleFolderFilter = (value: string) => {
        if (onFolderFilter) {
            onFolderFilter(value === 'all' ? '' : value);
        }
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onSearch && (
                        <div className="relative">
                            <Input
                                placeholder={searchPlaceholder || `${__('general.search')} ${__('general.ssh_manager')}`}
                                className="pl-9"
                                value={searchValue}
                                onChange={onSearch}
                            />
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="size-4" />
                            </span>
                        </div>
                    )}
                    {onFolderFilter && (
                        <Select value={folderFilter || 'all'} onValueChange={handleFolderFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder={__('messages.all_folders')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{__('messages.all_folders')}</SelectItem>
                                <SelectItem value="no_folder">{__('messages.no_folder')}</SelectItem>
                                {folders.map((folder) => (
                                    <SelectItem key={folder.id} value={folder.id.toString()}>
                                        {folder.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                {showCreateButton && (
                    <CreateItem
                        label={__('ssh.create_ssh')}
                        FormComponent={FormComponent}
                        formProps={defaultFolder ? { defaultFolder } : {}}
                        type="sheet"
                    />
                )}
            </div>

            <Card className="p-0 pb-2">
                <Table>
                    {sshs.data.length === 0 && <TableCaption>{__('ssh.no_sshs_founds')}</TableCaption>}
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">{__('fields.name')}</TableHead>
                            <TableHead className="text-start text-xs">{__('fields.username')}</TableHead>
                            <TableHead className="text-start text-xs">{__('fields.ip')}</TableHead>
                            <TableHead className="text-start text-xs">{__('ssh.prompt')}</TableHead>
                            <TableHead className="text-start text-xs">{__('fields.password')}</TableHead>
                            {showFolder && <TableHead className="text-start text-xs">{__('fields.folder')}</TableHead>}
                            <TableHead className="text-end text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                <span className="sr-only">{__('words.actions')}</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sshs.data.map((ssh) => (
                            <TableRow key={ssh.id}>
                                <TableCell className="text-start text-sm">{ssh.name}</TableCell>
                                <TableCell className="text-start text-sm">
                                    <span className="cursor-pointer" onClick={() => copyToClipboard(ssh.username)}>
                                        {ssh.username}
                                    </span>
                                </TableCell>
                                <TableCell className="text-start text-sm">
                                    <span className="cursor-pointer" onClick={() => copyToClipboard(ssh.ip)}>
                                        {ssh.ip}
                                    </span>
                                </TableCell>
                                <TableCell className="text-start text-sm">
                                    <span className="cursor-pointer" onClick={() => copyToClipboard(ssh.prompt)}>
                                        {ssh.prompt}
                                    </span>
                                </TableCell>
                                <TableCell className="w-40 text-start text-sm">
                                    <span className="cursor-pointer ltr:mr-2 rtl:ml-2" onClick={() => copyToClipboard(ssh.password)}>
                                        {showingPasswords.includes(ssh.id) ? ssh.password : '**************'}
                                    </span>
                                    <Button size="icon" variant="ghost" onClick={() => toggleShowPassword(ssh.id)}>
                                        {showingPasswords.includes(ssh.id) ? (
                                            <EyeOff className="size-4 text-red-300" />
                                        ) : (
                                            <Eye className="size-4 text-blue-400" />
                                        )}
                                    </Button>
                                </TableCell>
                                {showFolder && (
                                    <TableCell className="text-start text-sm">
                                        {ssh.folder ? (
                                            <Link href={route('dashboard.folders.show', ssh.folder.id)} className="font-bold text-blue-700">
                                                {ssh.folder.name}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                )}
                                <ActionCell
                                    updateLabel={__('ssh.update_ssh')}
                                    item={{ ssh }}
                                    FormComponent={FormComponent}
                                    onDestroy={destroy}
                                    type="sheet"
                                />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <TablePagination pagination={sshs} />
        </div>
    );
}
