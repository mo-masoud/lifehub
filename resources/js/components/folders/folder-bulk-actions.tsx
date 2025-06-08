import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { ChevronDown, Star, StarOff, Trash2 } from 'lucide-react';
import { FC, useState } from 'react';
import { toast } from 'sonner';
import { BulkDeleteFoldersDialog } from './bulk-delete-folders-dialog';

interface FolderBulkActionsProps {
    selectedFolderIds: Set<number>;
}

export const FolderBulkActions: FC<FolderBulkActionsProps> = ({ selectedFolderIds }) => {
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const selectedCount = selectedFolderIds.size;

    const handleBulkToggleFeatured = (featured: boolean) => {
        const folderIds = Array.from(selectedFolderIds);

        router.put(
            route('folders.bulk-update'),
            {
                folder_ids: folderIds,
                featured: featured,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${selectedCount} folder${selectedCount === 1 ? '' : 's'} updated successfully`);
                },
                onError: () => {
                    toast.error('Failed to update folders');
                },
            },
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-auto">
                        {selectedCount} selected
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkToggleFeatured(true)}>
                        <Star className="mr-2 h-4 w-4" />
                        Add to featured
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkToggleFeatured(false)}>
                        <StarOff className="mr-2 h-4 w-4" />
                        Remove from featured
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBulkDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete folders
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <BulkDeleteFoldersDialog selectedFolderIds={selectedFolderIds} open={bulkDeleteDialogOpen} setOpen={setBulkDeleteDialogOpen} />
        </>
    );
};
