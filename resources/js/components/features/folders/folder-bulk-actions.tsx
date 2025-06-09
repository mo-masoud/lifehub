import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDeleteFolder } from '@/contexts/folders/delete-folder-context';
import { router } from '@inertiajs/react';
import { ChevronDown, Star, StarOff, Trash2 } from 'lucide-react';
import { FC } from 'react';
import { toast } from 'sonner';

interface FolderBulkActionsProps {
    selectedFolderIds: Set<number>;
}

export const FolderBulkActions: FC<FolderBulkActionsProps> = ({ selectedFolderIds }) => {
    const { openBulkDialog: openBulkDeleteDialog } = useDeleteFolder();
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
                        <span className="hidden md:block">Selected ({selectedCount})</span>
                        <ChevronDown className="ml-2 size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkToggleFeatured(true)}>
                        <Star className="mr-2 size-4" />
                        Featured
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkToggleFeatured(false)}>
                        <StarOff className="mr-2 size-4" />
                        Un featured
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openBulkDeleteDialog(selectedFolderIds)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 size-4" />
                        Delete folders
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
