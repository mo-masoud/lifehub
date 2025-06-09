import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface RemoveFromFolderDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    selectedPasswordIds: Set<number>;
}

export function RemoveFromFolderDialog({ open, setOpen, selectedPasswordIds }: RemoveFromFolderDialogProps) {
    const [processing, setProcessing] = useState(false);

    const handleRemove = () => {
        setProcessing(true);

        router.post(
            route('passwords.remove-from-folder'),
            {
                ids: Array.from(selectedPasswordIds),
            },
            {
                onSuccess: () => {
                    toast.success('Passwords removed from folder successfully');
                    setOpen(false);
                },
                onError: () => {
                    toast.error('Failed to remove passwords from folder');
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Remove {selectedPasswordIds.size} Passwords from Folder</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove these passwords from their current folder? They will be moved to "No folder".
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleRemove} disabled={processing}>
                        {processing ? 'Removing...' : 'Remove from Folder'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
