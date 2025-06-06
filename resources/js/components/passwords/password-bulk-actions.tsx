import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FolderInput, FolderOutput, TableOfContents, Trash2 } from 'lucide-react';

export function PasswordBulkActions({ selectedPasswordIds }: { selectedPasswordIds: Set<number> }) {
    return (
        <DropdownMenu>
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
                <DropdownMenuItem className="cursor-pointer" variant="destructive">
                    <Trash2 className="size-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
