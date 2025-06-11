import { TableBody, TableCaption } from '@/components/ui/table';
import { Password, SortDirection, SortKey } from '@/types/passwords';
import { PasswordTableRow } from './password-table-row';
import { PasswordsTableHeader } from './passwords-table-header';
import { SimplePasswordsTableHeader } from './simple-passwords-table-header';

interface PasswordsTableProps {
    passwords: Password[];
    hasFullFunctionality?: boolean;
    sortKey?: SortKey;
    sortDirection?: SortDirection;
    onSortChange?: (key: SortKey) => void;
    selectedPasswordIds?: Set<number>;
    onSelectAll?: (checked: boolean) => void;
    onSelectPassword?: (passwordId: number, checked: boolean) => void;
    isAllSelected?: boolean;
    isIndeterminate?: boolean;
}

export function PasswordsTable({
    passwords,
    hasFullFunctionality = false,
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
        <div
            className={
                hasFullFunctionality
                    ? 'border-sidebar-border/70 dark:border-sidebar-border mt-8 max-h-[calc(100%-180px)] flex-1 overflow-auto rounded-md border md:max-h-[calc(100%-120px)]'
                    : 'relative w-full overflow-auto'
            }
        >
            <div className="relative w-full">
                <table className="w-full caption-bottom text-sm select-none">
                    {!passwords.length && <TableCaption className="text-muted-foreground my-4 text-sm">No passwords found.</TableCaption>}

                    {hasFullFunctionality ? (
                        <PasswordsTableHeader
                            sortKey={sortKey!}
                            sortDirection={sortDirection!}
                            onSortChange={onSortChange!}
                            isAllSelected={isAllSelected!}
                            isIndeterminate={isIndeterminate!}
                            onSelectAll={onSelectAll!}
                        />
                    ) : (
                        <SimplePasswordsTableHeader />
                    )}

                    <TableBody>
                        {passwords.map((password) => (
                            <PasswordTableRow
                                key={password.id}
                                password={password}
                                canSelect={hasFullFunctionality}
                                isSelected={selectedPasswordIds?.has(password.id) || false}
                                onSelectionChange={onSelectPassword ? (checked: boolean) => onSelectPassword(password.id, checked) : undefined}
                            />
                        ))}
                    </TableBody>
                </table>
            </div>
        </div>
    );
}
