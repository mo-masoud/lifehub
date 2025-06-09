import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionType } from '@/types/audit-logs';

interface AuditLogFiltersProps {
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

export function AuditLogFilters({
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
}: AuditLogFiltersProps) {
    const handlePasswordChange = (value: string) => {
        if (value === 'all') {
            onPasswordIdChange(undefined);
        } else {
            onPasswordIdChange(parseInt(value, 10));
        }
    };

    const handleActionChange = (value: string) => {
        if (value === 'all') {
            onActionChange(undefined);
        } else {
            onActionChange(value as ActionType);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="flex w-full items-center gap-2">
                <Select value={passwordId?.toString() || 'all'} onValueChange={handlePasswordChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="All passwords" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All passwords</SelectItem>
                        {userPasswords.map((password) => (
                            <SelectItem key={password.id} value={password.id.toString()}>
                                {password.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex w-full items-center gap-2">
                <Select value={action || 'all'} onValueChange={handleActionChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All actions</SelectItem>
                        {Object.entries(availableActions).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex w-full items-center gap-2">
                <Label htmlFor="start-date" className="sr-only">
                    Start Date
                </Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} placeholder="Start date" />
            </div>

            <div className="flex w-full items-center gap-2">
                <Label htmlFor="end-date" className="sr-only">
                    End Date
                </Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} placeholder="End date" />
            </div>
        </div>
    );
}
