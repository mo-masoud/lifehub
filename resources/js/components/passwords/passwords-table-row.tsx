import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Password } from '@/types/models';
import { KeyRound, Terminal, TerminalSquare, User } from 'lucide-react';
import { FC } from 'react';
import { QuickTooltip } from '../quick-tooltip';
import { ViewPasswordSheet } from './view-password-sheet';

interface PasswordTableRowProps {
    password: Password;
}

export const PasswordsTableRow: FC<PasswordTableRowProps> = ({ password }) => {
    return (
        <ViewPasswordSheet password={password}>
            <TableRow
                className={cn(
                    'min-h-20 cursor-pointer',
                    password.is_expired && 'bg-destructive/5 hover:bg-destructive/10',
                    password.is_expired_soon && 'bg-warning/5 hover:bg-warning/10',
                )}
                onClick={() => console.log('Row clicked:', password.name)}
            >
                <TableCell className="text-primary text-xs font-bold">{password.id}</TableCell>
                <TableCell>
                    <span className="flex items-center gap-2">
                        {password.type === 'ssh' ? <Terminal className="size-4" /> : <KeyRound className="size-4" />}
                        <span className="font-semibold capitalize">{password.name}</span>
                    </span>
                </TableCell>
                <TableCell>{password.username}</TableCell>
                <TableCell className="capitalize">{password.folder?.name || '-'}</TableCell>
                <TableCell>{password.last_used_at_formatted}</TableCell>
                <TableCell className={cn('flex items-center justify-end md:gap-2')}>
                    {password.type === 'ssh' ? (
                        <QuickTooltip content="Copy SSH command" asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('SSH button clicked');
                                }}
                            >
                                <TerminalSquare />
                            </Button>
                        </QuickTooltip>
                    ) : (
                        <QuickTooltip content="Copy username" asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('User button clicked');
                                }}
                            >
                                <User />
                            </Button>
                        </QuickTooltip>
                    )}
                    <QuickTooltip content="Copy password" asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Copy password clicked');
                            }}
                        >
                            <KeyRound />
                        </Button>
                    </QuickTooltip>
                </TableCell>
            </TableRow>
        </ViewPasswordSheet>
    );
};
