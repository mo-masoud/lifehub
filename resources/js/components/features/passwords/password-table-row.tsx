import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Password } from '@/types/passwords';
import { Folder, KeyRound, Terminal } from 'lucide-react';
import { FC, useState } from 'react';
import { PasswordRowActions } from './password-row-actions';
import { ViewPasswordSheet } from './view-password-sheet';

interface PasswordTableRowProps {
    password: Password;
    isSelected?: boolean;
    onSelectionChange?: (checked: boolean) => void;
}

export const PasswordTableRow: FC<PasswordTableRowProps> = ({ password, isSelected = false, onSelectionChange }) => {
    const [viewSheetOpen, setViewSheetOpen] = useState(false);

    const handleRowClick = () => {
        setViewSheetOpen(true);
    };

    return (
        <>
            <TableRow className={cn('min-h-20 cursor-pointer', isSelected && 'bg-accent/50')} onClick={handleRowClick}>
                <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                    {onSelectionChange && (
                        <Checkbox checked={isSelected} onCheckedChange={onSelectionChange} aria-label={`Select password ${password.name}`} />
                    )}
                </TableCell>
                <TableCell>
                    <span className="flex items-center gap-2">
                        {password.type === 'ssh' ? <Terminal className="size-3.5" /> : <KeyRound className="size-3.5" />}
                        <span className="font-semibold capitalize">{password.name}</span>
                    </span>
                </TableCell>
                <TableCell className="max-w-20 truncate">{password.username}</TableCell>
                <TableCell>
                    {password.folder ? (
                        <span className="inline-flex items-center gap-1 capitalize">
                            <Folder className="size-3.5" />
                            {password.folder.name}
                        </span>
                    ) : (
                        '-'
                    )}
                </TableCell>
                <TableCell>{password.last_used_at_formatted}</TableCell>
                <TableCell>
                    <PasswordRowActions password={password} />
                </TableCell>
            </TableRow>

            <ViewPasswordSheet password={password} open={viewSheetOpen} setOpen={setViewSheetOpen} />
        </>
    );
};
