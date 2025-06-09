import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDeletePassword } from '@/contexts/passwords/delete-password-context';
import { useEditPassword } from '@/contexts/passwords/edit-password-context';
import { usePasswords } from '@/hooks/passwords/use-passwords';
import { Password } from '@/types/passwords';
import { Edit, KeyRound, MoreHorizontal, TerminalSquare, Trash2, User } from 'lucide-react';
import { useState } from 'react';

interface PasswordRowActionsProps {
    password: Password;
}

export function PasswordRowActions({ password }: PasswordRowActionsProps) {
    const { handleCopy } = usePasswords();
    const { openSheet: openEditSheet } = useEditPassword();
    const { openDialog: openDeleteDialog } = useDeletePassword();
    const [moreActionsDropdownOpen, setMoreActionsDropdownOpen] = useState(false);

    const handleCopyPassword = (key: string) => {
        handleCopy(key, password);
    };

    const handleEditPassword = () => {
        setMoreActionsDropdownOpen(false);
        // Small delay to allow dropdown close animation to complete before opening sheet
        setTimeout(() => {
            openEditSheet(password);
        }, 150);
    };

    const handleDeletePassword = () => {
        setMoreActionsDropdownOpen(false);
        // Small delay to allow dropdown close animation to complete before opening dialog
        setTimeout(() => {
            openDeleteDialog(password);
        }, 150);
    };

    return (
        <div className="flex items-center justify-end gap-1">
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
                            handleEditPassword();
                        }}
                    >
                        <Edit />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePassword();
                        }}
                        variant="destructive"
                    >
                        <Trash2 />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
