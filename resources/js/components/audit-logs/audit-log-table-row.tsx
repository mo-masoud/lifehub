import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { AuditLog } from '@/types/audit-logs';
import { Folder, Globe, Monitor, Terminal } from 'lucide-react';
import { FC } from 'react';

interface AuditLogTableRowProps {
    auditLog: AuditLog;
}

export const AuditLogTableRow: FC<AuditLogTableRowProps> = ({ auditLog }) => {
    const getActionColor = (action: string) => {
        switch (action) {
            case 'created':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'updated':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'deleted':
            case 'bulk_deleted':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'copied':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'viewed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            case 'moved_to_folder':
            case 'removed_from_folder':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getContextIcon = (context: string) => {
        switch (context) {
            case 'web':
                return <Monitor className="size-3.5" />;
            case 'api':
                return <Globe className="size-3.5" />;
            case 'cli':
                return <Terminal className="size-3.5" />;
            default:
                return <Monitor className="size-3.5" />;
        }
    };

    return (
        <TableRow className="min-h-16">
            <TableCell>
                <Badge className={`${getActionColor(auditLog.action)} border-none`}>{auditLog.action_display}</Badge>
            </TableCell>
            <TableCell className="font-mono text-sm">{auditLog.created_at_formatted}</TableCell>
            <TableCell className="max-w-32 truncate font-semibold">{auditLog.masked_password_name}</TableCell>
            <TableCell>
                {auditLog.password?.folder ? (
                    <span className="inline-flex items-center gap-1 capitalize">
                        <Folder className="size-3.5" />
                        {auditLog.password.folder.name}
                    </span>
                ) : (
                    '-'
                )}
            </TableCell>
            <TableCell className="font-mono text-sm">{auditLog.ip_address || '-'}</TableCell>
            <TableCell>
                <span className="inline-flex items-center gap-1 capitalize">
                    {getContextIcon(auditLog.context)}
                    {auditLog.context}
                </span>
            </TableCell>
        </TableRow>
    );
};
