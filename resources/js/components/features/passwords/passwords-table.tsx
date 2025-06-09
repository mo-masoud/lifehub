import { TableBody, TableCaption } from '@/components/ui/table';
import { Password, SortDirection, SortKey } from '@/types/passwords';
import { PasswordTableRow } from './password-table-row';
import { PasswordsTableHeader } from './passwords-table-header';

interface PasswordsTableProps {
    passwords: Password[];
    sortKey: SortKey;
    sortDirection: SortDirection;
    onSortChange: (key: SortKey) => void;
    selectedPasswordIds: Set<number>;
    onSelectAll: (checked: boolean) => void;
    onSelectPassword: (passwordId: number, checked: boolean) => void;
    isAllSelected: boolean;
    isIndeterminate: boolean;
}

export function PasswordsTable({
    passwords,
    sortKey,
    sortDirection,
    onSortChange,
    selectedPasswordIds,
    onSelectAll,
    onSelectPassword,
    isAllSelected,
    isIndeterminate,
}: PasswordsTableProps) {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border mt-8 max-h-[calc(100%-180px)] flex-1 overflow-auto rounded-md border md:max-h-[calc(100%-120px)]">
            <div className="relative w-full">
                <table className="w-full caption-bottom text-sm select-none">
                    {!passwords.length && <TableCaption className="text-muted-foreground my-4 text-sm">No passwords found.</TableCaption>}

                    <PasswordsTableHeader
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        isAllSelected={isAllSelected}
                        isIndeterminate={isIndeterminate}
                        onSelectAll={onSelectAll}
                    />

                    <TableBody>
                        {passwords.map((password) => (
                            <PasswordTableRow
                                key={password.id}
                                password={password}
                                isSelected={selectedPasswordIds.has(password.id)}
                                onSelectionChange={(checked: boolean) => onSelectPassword(password.id, checked)}
                            />
                        ))}
                    </TableBody>
                </table>
            </div>
        </div>
    );
}
