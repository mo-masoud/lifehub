import { Checkbox } from '@/components/ui/checkbox';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { FolderSortKey } from '@/types/folders';
import { ChevronDown } from 'lucide-react';
import { FC } from 'react';

interface FoldersTableHeaderProps {
    sortKey?: FolderSortKey;
    sortDirection?: 'asc' | 'desc';
    onSortChange: (key: FolderSortKey) => void;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    onSelectAll: () => void;
}

export const FoldersTableHeader: FC<FoldersTableHeaderProps> = ({
    sortKey,
    sortDirection,
    onSortChange,
    isAllSelected,
    isIndeterminate,
    onSelectAll,
}) => {
    return (
        <TableHeader className="bg-muted sticky top-0 z-15">
            <TableRow>
                <TableHead className="w-12">
                    <Checkbox
                        checked={isAllSelected || isIndeterminate}
                        onCheckedChange={onSelectAll}
                        aria-label="Select all folders"
                        indeterminate={isIndeterminate}
                    />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => onSortChange('name')}>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">
                        Name
                        <ChevronDown
                            className={cn(
                                'size-4 transition-all duration-100 ease-in-out',
                                sortKey === 'name' ? 'opacity-85' : 'opacity-0',
                                sortDirection === 'asc' && 'rotate-180',
                            )}
                        />
                    </span>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => onSortChange('passwords_count')}>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">
                        Passwords
                        <ChevronDown
                            className={cn(
                                'size-4 transition-all duration-100 ease-in-out',
                                sortKey === 'passwords_count' ? 'opacity-85' : 'opacity-0',
                                sortDirection === 'asc' && 'rotate-180',
                            )}
                        />
                    </span>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => onSortChange('created_at')}>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">
                        Created
                        <ChevronDown
                            className={cn(
                                'size-4 transition-all duration-100 ease-in-out',
                                sortKey === 'created_at' ? 'opacity-85' : 'opacity-0',
                                sortDirection === 'asc' && 'rotate-180',
                            )}
                        />
                    </span>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => onSortChange('updated_at')}>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">
                        Updated
                        <ChevronDown
                            className={cn(
                                'size-4 transition-all duration-100 ease-in-out',
                                sortKey === 'updated_at' ? 'opacity-85' : 'opacity-0',
                                sortDirection === 'asc' && 'rotate-180',
                            )}
                        />
                    </span>
                </TableHead>
                <TableHead className="text-end">
                    <span className="sr-only">Actions</span>
                </TableHead>
            </TableRow>
        </TableHeader>
    );
};
