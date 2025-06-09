import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Folder } from '@/types/folders';
import { useForm } from '@inertiajs/react';
import { FC, FormEvent } from 'react';

interface EditFolderDialogProps {
    folder: Folder;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const EditFolderDialog: FC<EditFolderDialogProps> = ({ folder, open, setOpen }) => {
    const { data, setData, put, processing, errors, reset } = useForm<{
        name: string;
        featured: boolean;
    }>({
        name: folder.name || '',
        featured: folder.featured || false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('folders.update', folder.id), {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    const handleClose = () => {
        setOpen(false);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Folder</DialogTitle>
                    <DialogDescription>Update the folder details.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Folder Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter folder name"
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="featured" checked={data.featured} onCheckedChange={(checked) => setData('featured', !!checked)} />
                        <Label
                            htmlFor="featured"
                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Featured folder
                        </Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Update Folder
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
