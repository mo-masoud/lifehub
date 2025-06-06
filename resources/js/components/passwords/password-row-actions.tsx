import { Button } from '@/components/ui/button';
import { usePasswords } from '@/hooks/use-passwords';
import { Password } from '@/types/models';
import { KeyRound, TerminalSquare, User } from 'lucide-react';
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
        </>
    );
};
