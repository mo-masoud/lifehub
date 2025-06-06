import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Password } from '@/types/models';
import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { FC, useState } from 'react';
import { toast } from 'sonner';

interface DeletePasswordDialogProps {
    password: Password;
}

export const DeletePasswordDialog: FC<DeletePasswordDialogProps> = ({ password }) => {
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        router.delete(route('passwords.destroy', { password: password.id }), {
            onSuccess: () => {
                toast.success('Password deleted successfully');
                setOpen(false);
            },
            onError: () => {
                toast.error('Failed to delete password');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive-outline">
                    <Trash2 />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Password</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this password? This action cannot be undone.</DialogDescription>
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
};
