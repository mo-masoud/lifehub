import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { FC } from 'react';
import { toast } from 'sonner';

interface BulkDeleteFoldersDialogProps {
    selectedFolderIds: Set<number>;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const BulkDeleteFoldersDialog: FC<BulkDeleteFoldersDialogProps> = ({ selectedFolderIds, open, setOpen }) => {
    const selectedCount = selectedFolderIds.size;

    const handleBulkDelete = () => {
        const folderIds = Array.from(selectedFolderIds);

        router.delete(route('folders.bulk-destroy'), {
            data: { folder_ids: folderIds },
            onSuccess: () => {
                setOpen(false);
                toast.success(`${selectedCount} folder${selectedCount === 1 ? '' : 's'} deleted successfully`);
            },
            onError: () => {
                toast.error('Failed to delete folders');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Folders</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete {selectedCount} folder{selectedCount === 1 ? '' : 's'}? This action cannot be undone.
                        <span className="mt-2 block text-amber-600 dark:text-amber-400">
                            Any passwords in these folders will be moved to "No folder".
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleBulkDelete}>
                        Delete {selectedCount} Folder{selectedCount === 1 ? '' : 's'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
