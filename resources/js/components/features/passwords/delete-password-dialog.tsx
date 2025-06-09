import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Password } from '@/types/passwords';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface DeletePasswordDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    password?: Password;
    selectedPasswordIds?: Set<number>;
}

export function DeletePasswordDialog({ open, setOpen, password, selectedPasswordIds }: DeletePasswordDialogProps) {
    const handleDelete = () => {
        if (password) {
            router.delete(route('passwords.destroy', { password: password.id }), {
                onSuccess: () => {
                    toast.success('Password deleted successfully');
                    setOpen(false);
                },
                onError: () => {
                    toast.error('Failed to delete password');
                },
            });
        } else if (selectedPasswordIds) {
            router.post(
                route('passwords.destroy-bulk'),
                {
                    ids: Array.from(selectedPasswordIds),
                },
                {
                    onSuccess: () => {
                        toast.success('Passwords deleted successfully');
                        setOpen(false);
                    },
                    onError: () => {
                        toast.error('Failed to delete passwords');
                    },
                },
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>{password ? 'Delete Password' : `Delete ${selectedPasswordIds?.size} Passwords?`}</DialogTitle>
                    <DialogDescription>
                        {password
                            ? 'Are you sure you want to delete this password? This action cannot be undone.'
                            : 'Are you sure you want to delete these passwords? This action cannot be undone.'}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
