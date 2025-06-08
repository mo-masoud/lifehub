import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Folder } from '@/types/folders';
import { router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Star, StarOff, Trash2 } from 'lucide-react';
import { FC, useState } from 'react';
import { toast } from 'sonner';
import { DeleteFolderDialog } from './delete-folder-dialog';

interface FolderRowActionsProps {
    folder: Folder;
    onEdit?: () => void;
}

export const FolderRowActions: FC<FolderRowActionsProps> = ({ folder, onEdit }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleToggleFeatured = () => {
        router.put(
            route('folders.update', folder.id),
            { featured: !folder.featured, name: folder.name },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(folder.featured ? 'Folder removed from featured' : 'Folder added to featured');
                },
                onError: () => {
                    toast.error('Failed to update folder');
                },
            },
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleFeatured}>
                        {folder.featured ? (
                            <>
                                <StarOff className="mr-2 h-4 w-4" />
                                Remove from featured
                            </>
                        ) : (
                            <>
                                <Star className="mr-2 h-4 w-4" />
                                Add to featured
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className={cn('text-destructive focus:text-destructive')}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteFolderDialog folder={folder} open={deleteDialogOpen} setOpen={setDeleteDialogOpen} />
        </>
    );
};
