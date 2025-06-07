import { Button } from '@/components/ui/button';
import { usePasswords } from '@/hooks/use-passwords';
import { Password } from '@/types/models';
import { Edit, KeyRound, MoreHorizontal, TerminalSquare, Trash2, User } from 'lucide-react';
import { FC, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { DeletePasswordDialog } from './delete-password-dialog';
import { EditPasswordSheet } from './edit-password-sheet';

interface PasswordRowActionsProps {
    password: Password;
}

export const PasswordRowActions: FC<PasswordRowActionsProps> = ({ password }) => {
    const { handleCopy } = usePasswords();
    const [moreActionsDropdownOpen, setMoreActionsDropdownOpen] = useState(false);
    const [editPasswordSheetOpen, setEditPasswordSheetOpen] = useState(false);
    const [deletePasswordDialogOpen, setDeletePasswordDialogOpen] = useState(false);
    const handleCopyPassword = (key: string) => {
        handleCopy(key, password);
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            {password.is_expired && <span className="text-destructive text-xs italic">Expired</span>}
            {password.is_expired_soon && <span className="text-warning text-xs italic">Expiring soon</span>}
            {password.type === 'ssh' ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted-foreground/5"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPassword('cli');
                    }}
                >
                    <TerminalSquare />
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-accent-foreground/5"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPassword('username');
                    }}
                >
                    <User />
                </Button>
            )}
            <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent-foreground/5"
                onClick={(e) => {
                    e.stopPropagation();
                    handleCopyPassword('password');
                }}
            >
                <KeyRound />
            </Button>

            <DropdownMenu open={moreActionsDropdownOpen} onOpenChange={setMoreActionsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setMoreActionsDropdownOpen(false);
                            setEditPasswordSheetOpen(true);
                        }}
                    >
                        <Edit />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setMoreActionsDropdownOpen(false);
                            setDeletePasswordDialogOpen(true);
                        }}
                        variant="destructive"
                    >
                        <Trash2 />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditPasswordSheet password={password} open={editPasswordSheetOpen} setOpen={setEditPasswordSheetOpen} />
            <DeletePasswordDialog password={password} open={deletePasswordDialogOpen} setOpen={setDeletePasswordDialogOpen} />
        </div>
    );
};
