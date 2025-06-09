import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDeleteFolder } from '@/contexts/delete-folder-context';
import { useEditFolder } from '@/contexts/edit-folder-context';
import { Folder } from '@/types/folders';
import { router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Star, StarOff, Trash2 } from 'lucide-react';
import { FC, useState } from 'react';
import { toast } from 'sonner';

interface FolderRowActionsProps {
    folder: Folder;
}

export const FolderRowActions: FC<FolderRowActionsProps> = ({ folder }) => {
    const { openDialog: openEditDialog } = useEditFolder();
    const { openDialog: openDeleteDialog } = useDeleteFolder();

    const [open, setOpen] = useState(false);

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
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => {
                            setOpen(false);
                            setTimeout(() => {
                                openEditDialog(folder);
                            }, 300);
                        }}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleFeatured}>
                        {folder.featured ? (
                            <>
                                <StarOff className="mr-2 h-4 w-4" />
                                Un featured
                            </>
                        ) : (
                            <>
                                <Star className="mr-2 h-4 w-4" />
                                Featured
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                            setOpen(false);
                            setTimeout(() => {
                                openDeleteDialog(folder);
                            }, 300);
                        }}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
