import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Folder } from '@/types/folders';
import { FolderIcon, Star } from 'lucide-react';
import { FolderRowActions } from './folder-row-actions';

interface FolderTableRowProps {
    folder: Folder;
    isSelected?: boolean;
    onSelectionChange?: () => void;
}

export function FolderTableRow({ folder, isSelected = false, onSelectionChange }: FolderTableRowProps) {
    // Format dates
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
            <TableRow className={cn('min-h-20', isSelected && 'bg-accent/50')}>
                <TableCell className="w-12">
                    {onSelectionChange && (
                        <Checkbox checked={isSelected} onCheckedChange={onSelectionChange} aria-label={`Select folder ${folder.name}`} />
                    )}
                </TableCell>
                <TableCell>
                    <span className="flex items-center gap-2">
                        <FolderIcon className="size-3.5" />
                        <span className="font-semibold">{folder.name}</span>
                        {folder.featured && <Star className="size-3.5 fill-yellow-400 text-yellow-400" />}
                    </span>
                </TableCell>

                <TableCell className="text-muted-foreground text-sm">{formatDate(folder.created_at)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(folder.updated_at)}</TableCell>
                <TableCell>
                    <FolderRowActions folder={folder} />
                </TableCell>
            </TableRow>
        </>
    );
}
