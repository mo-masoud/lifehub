import { FoldersCombobox } from '@/components/folders/folders-combobox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { FC, useState } from 'react';
import { toast } from 'sonner';

interface MoveToFolderDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    selectedPasswordIds: Set<number>;
}

export const MoveToFolderDialog: FC<MoveToFolderDialogProps> = ({ open, setOpen, selectedPasswordIds }) => {
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    const handleMove = () => {
        if (!selectedFolder || selectedFolder === 'all') {
            toast.error('Please select a folder');
            return;
        }

        setProcessing(true);

        const folderId = selectedFolder === 'none' ? null : parseInt(selectedFolder);

        router.post(
            route('passwords.move-to-folder'),
            {
                ids: Array.from(selectedPasswordIds),
                folder_id: folderId,
            },
            {
                onSuccess: () => {
                    toast.success('Passwords moved successfully');
                    setOpen(false);
                    setSelectedFolder('');
                },
                onError: () => {
                    toast.error('Failed to move passwords');
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setSelectedFolder('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Move {selectedPasswordIds.size} Passwords to Folder</DialogTitle>
                    <DialogDescription>Select the folder where you want to move the selected passwords.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <FoldersCombobox selectedFolder={selectedFolder} onSelectFolder={setSelectedFolder} canCreateFolder={true} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleMove} disabled={processing}>
                        {processing ? 'Moving...' : 'Move'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
