import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePasswords } from '@/hooks/use-passwords';
import { Password } from '@/types/models';
import { Edit, FolderInput, FolderOutput, KeyRound, MoreHorizontal, TerminalSquare, Trash2, User } from 'lucide-react';
import { FC } from 'react';

interface PasswordRowActionsProps {
    password: Password;
}

export const PasswordRowActions: FC<PasswordRowActionsProps> = ({ password }) => {
    const { handleCopy } = usePasswords();

    const handleCopyPassword = (key: string) => {
        handleCopy(key, password);
    };

    return (
        <>
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

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-accent-foreground/5"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Edit />
                        Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <FolderInput />
                        Move to folder
                    </DropdownMenuItem>

                    {password.folder && (
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <FolderOutput />
                            Remove from folder
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Trash2 />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
