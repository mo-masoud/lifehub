import { Checkbox } from '@/components/ui/checkbox';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { SortDirection, SortKey } from '@/types/passwords';
import { ChevronDown } from 'lucide-react';
import { FC } from 'react';

interface PasswordsTableHeaderProps {
    sortKey: SortKey;
    sortDirection: SortDirection;
    onSortChange: (key: SortKey) => void;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    onSelectAll: (checked: boolean) => void;
}

export const PasswordsTableHeader: FC<PasswordsTableHeaderProps> = ({
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
                        aria-label="Select all passwords"
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
                <TableHead className="cursor-pointer" onClick={() => onSortChange('username')}>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">
                        Username
                        <ChevronDown
                            className={cn(
                                'size-4 transition-all duration-100 ease-in-out',
                                sortKey === 'username' ? 'opacity-85' : 'opacity-0',
                                sortDirection === 'asc' && 'rotate-180',
                            )}
                        />
                    </span>
                </TableHead>
                <TableHead>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">Folder</span>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => onSortChange('last_used_at')}>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">
                        Last used
                        <ChevronDown
                            className={cn(
                                'size-4 transition-all duration-100 ease-in-out',
                                sortKey === 'last_used_at' ? 'opacity-85' : 'opacity-0',
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
