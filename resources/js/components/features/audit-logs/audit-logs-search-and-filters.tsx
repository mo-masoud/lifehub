import { Input } from '@/components/ui/input';
import { ActionType } from '@/types/audit-logs';
import { Search } from 'lucide-react';
import { ChangeEvent } from 'react';
import { AuditLogFilters } from './audit-log-filters';

interface AuditLogsSearchAndFiltersProps {
    search: string;
    onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
    passwordId: number | undefined;
    onPasswordIdChange: (passwordId: number | undefined) => void;
    action: ActionType | undefined;
    onActionChange: (action: ActionType | undefined) => void;
    startDate: string;
    onStartDateChange: (startDate: string) => void;
    endDate: string;
    onEndDateChange: (endDate: string) => void;
    userPasswords: Array<{ id: number; name: string }>;
    availableActions: Record<string, string>;
}

export function AuditLogsSearchAndFilters({
    search,
    onSearchChange,
    passwordId,
    onPasswordIdChange,
    action,
    onActionChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    userPasswords,
    availableActions,
}: AuditLogsSearchAndFiltersProps) {
    return (
        <div className="grid grid-cols-1 gap-4">
            <AuditLogFilters
                passwordId={passwordId}
                onPasswordIdChange={onPasswordIdChange}
                action={action}
                onActionChange={onActionChange}
                startDate={startDate}
                onStartDateChange={onStartDateChange}
                endDate={endDate}
                onEndDateChange={onEndDateChange}
                userPasswords={userPasswords}
                availableActions={availableActions}
            />
            <div className="relative mt-4 w-full max-w-md">
                <Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
                <Input placeholder="Search audit logs..." className="pl-10" value={search} onChange={onSearchChange} />
            </div>
        </div>
    );
}
