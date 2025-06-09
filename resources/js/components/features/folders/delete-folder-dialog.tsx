import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Folder } from '@/types/folders';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface DeleteFolderDialogProps {
    folder: Folder;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function DeleteFolderDialog({ folder, open, setOpen }: DeleteFolderDialogProps) {
    const handleDelete = () => {
        router.delete(route('folders.destroy', folder.id), {
            onSuccess: () => {
                setOpen(false);
                toast.success('Folder deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete folder');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Folder</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{folder.name}"? This action cannot be undone.
                        {folder.passwords_count > 0 && (
                            <span className="mt-2 block text-amber-600 dark:text-amber-400">
                                This folder contains {folder.passwords_count} password{folder.passwords_count === 1 ? '' : 's'}. All passwords in this
                                folder will be moved to "No folder".
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete Folder
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
