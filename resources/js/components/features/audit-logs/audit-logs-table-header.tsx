import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { SortDirection, SortKey } from '@/types/audit-logs';
import { ChevronDown } from 'lucide-react';

interface AuditLogsTableHeaderProps {
    sortKey: SortKey;
    sortDirection: SortDirection;
    onSortChange: (key: SortKey) => void;
}

export function AuditLogsTableHeader({ sortKey, sortDirection, onSortChange }: AuditLogsTableHeaderProps) {
    return (
        <TableHeader className="bg-muted sticky top-0 z-15">
            <TableRow>
                <TableHead className="cursor-pointer" onClick={() => onSortChange('action')}>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">
                        Action
                        <ChevronDown
                            className={cn(
                                'size-4 transition-all duration-100 ease-in-out',
                                sortKey === 'action' ? 'opacity-85' : 'opacity-0',
                                sortDirection === 'asc' && 'rotate-180',
                            )}
                        />
                    </span>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => onSortChange('created_at')}>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">
                        Timestamp
                        <ChevronDown
                            className={cn(
                                'size-4 transition-all duration-100 ease-in-out',
                                sortKey === 'created_at' ? 'opacity-85' : 'opacity-0',
                                sortDirection === 'asc' && 'rotate-180',
                            )}
                        />
                    </span>
                </TableHead>
                <TableHead>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">Password</span>
                </TableHead>
                <TableHead>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">Folder</span>
                </TableHead>
                <TableHead>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">Source IP</span>
                </TableHead>
                <TableHead>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase">Context</span>
                </TableHead>
            </TableRow>
        </TableHeader>
    );
}
