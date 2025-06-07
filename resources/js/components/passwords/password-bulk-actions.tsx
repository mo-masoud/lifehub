import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FolderInput, FolderOutput, TableOfContents, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeletePasswordDialog } from './delete-password-dialog';
import { MoveToFolderDialog } from './move-to-folder-dialog';
import { RemoveFromFolderDialog } from './remove-from-folder-dialog';

export function PasswordBulkActions({ selectedPasswordIds }: { selectedPasswordIds: Set<number> }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [moveToFolderDialogOpen, setMoveToFolderDialogOpen] = useState(false);
    const [removeFromFolderDialogOpen, setRemoveFromFolderDialogOpen] = useState(false);

    const handleOpenDeleteDialog = () => {
        setDropdownOpen(false);
        setDeleteDialogOpen(true);
    };

    const handleOpenMoveToFolderDialog = () => {
        setDropdownOpen(false);
        setMoveToFolderDialogOpen(true);
    };

    const handleOpenRemoveFromFolderDialog = () => {
        setDropdownOpen(false);
        setRemoveFromFolderDialogOpen(true);
    };

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <span className="hidden md:block">Selected ({selectedPasswordIds.size})</span>
                        <TableOfContents />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer" onClick={handleOpenMoveToFolderDialog}>
                        <FolderInput />
                        Move to folder
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleOpenRemoveFromFolderDialog}>
                        <FolderOutput />
                        Remove from folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={handleOpenDeleteDialog}>
                        <Trash2 className="size-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DeletePasswordDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} selectedPasswordIds={selectedPasswordIds} />
            <MoveToFolderDialog open={moveToFolderDialogOpen} setOpen={setMoveToFolderDialogOpen} selectedPasswordIds={selectedPasswordIds} />
            <RemoveFromFolderDialog
                open={removeFromFolderDialogOpen}
                setOpen={setRemoveFromFolderDialogOpen}
                selectedPasswordIds={selectedPasswordIds}
            />
        </>
    );
}
