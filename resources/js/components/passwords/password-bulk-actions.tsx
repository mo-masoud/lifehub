import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FolderInput, FolderOutput, TableOfContents, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeletePasswordDialog } from './delete-password-dialog';

export function PasswordBulkActions({ selectedPasswordIds }: { selectedPasswordIds: Set<number> }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleOpenDeleteDialog = () => {
        setDropdownOpen(false);
        setDeleteDialogOpen(true);
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
                    <DropdownMenuItem className="cursor-pointer">
                        <FolderInput />
                        Move to folder
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
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
        </>
    );
}
