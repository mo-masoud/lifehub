import { TableBody, TableCaption } from '@/components/ui/table';
import { AuditLog, SortDirection, SortKey } from '@/types/audit-logs';
import { FC } from 'react';
import { AuditLogTableRow } from './audit-log-table-row';
import { AuditLogsTableHeader } from './audit-logs-table-header';

interface AuditLogsTableProps {
    auditLogs: AuditLog[];
    sortKey: SortKey;
    sortDirection: SortDirection;
    onSortChange: (key: SortKey) => void;
}

export const AuditLogsTable: FC<AuditLogsTableProps> = ({ auditLogs, sortKey, sortDirection, onSortChange }) => {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border mt-4 max-h-[calc(100%-180px)] overflow-auto rounded-md border md:max-h-[calc(100%-120px)]">
            <div className="relative w-full">
                <table className="w-full caption-bottom text-sm select-none">
                    {!auditLogs.length && <TableCaption className="text-muted-foreground my-4 text-sm">No audit logs found.</TableCaption>}

                    <AuditLogsTableHeader sortKey={sortKey} sortDirection={sortDirection} onSortChange={onSortChange} />

                    <TableBody>
                        {auditLogs.map((auditLog) => (
                            <AuditLogTableRow key={auditLog.id} auditLog={auditLog} />
                        ))}
                    </TableBody>
                </table>
            </div>
        </div>
    );
};
