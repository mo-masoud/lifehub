import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Password } from '@/types/models';
import { KeyRound, Terminal, TerminalSquare, User } from 'lucide-react';
import { FC } from 'react';

interface PasswordTableRowProps {
    password: Password;
}

export const PasswordsTableRow: FC<PasswordTableRowProps> = ({ password }) => {
    return (
        <TableRow
            className={cn(
                'min-h-20 cursor-pointer',
                password.is_expired && 'bg-destructive/10 hover:bg-destructive/20',
                password.is_expired_soon && 'bg-warning/10 hover:bg-warning/20',
            )}
            onClick={() => console.log('Row clicked:', password.name)}
        >
            <TableCell className="text-primary text-xs font-bold">{password.id}</TableCell>
            <TableCell>
                <span className="flex items-center gap-2">
                    {password.type === 'ssh' ? <Terminal className="size-4 text-green-700" /> : <KeyRound className="size-4 text-rose-700" />}
                    <span className="font-semibold capitalize">{password.name}</span>
                </span>
            </TableCell>
            <TableCell>{password.username}</TableCell>
            <TableCell className="capitalize">{password.folder?.name || '-'}</TableCell>
            <TableCell>{password.last_used_at_formatted}</TableCell>
            <TableCell className={cn('flex items-center justify-end md:gap-2')}>
                {password.type === 'ssh' ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn('group', password.is_expired && 'hover:bg-destructive/20', password.is_expired_soon && 'hover:bg-warning/20')}
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('SSH button clicked');
                        }}
                    >
                        <TerminalSquare className="transition-colors duration-100 ease-in-out group-hover:text-orange-500" />
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn('group', password.is_expired && 'hover:bg-destructive/20', password.is_expired_soon && 'hover:bg-warning/20')}
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('User button clicked');
                        }}
                    >
                        <User className="transition-colors duration-100 ease-in-out group-hover:text-rose-500" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('group', password.is_expired && 'hover:bg-destructive/20', password.is_expired_soon && 'hover:bg-warning/20')}
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('Copy password clicked');
                    }}
                >
                    <KeyRound className="transition-colors duration-100 ease-in-out group-hover:text-sky-500" />
                </Button>
            </TableCell>
        </TableRow>
    );
};
