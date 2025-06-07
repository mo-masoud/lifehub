import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ViewPanel } from '@/components/view-panel';
import { useDeletePassword } from '@/contexts/delete-password-context';
import { useEditPassword } from '@/contexts/edit-password-context';
import { usePasswords } from '@/hooks/use-passwords';
import { cn } from '@/lib/utils';
import { Password } from '@/types/models';
import { Link } from '@inertiajs/react';
import {
    Copy,
    Edit,
    Eye,
    EyeOff,
    Folder,
    History,
    KeyRound,
    LinkIcon,
    LockKeyhole,
    ShieldCheck,
    StickyNote,
    Terminal,
    Timer,
    TimerOff,
    Trash2,
    User,
} from 'lucide-react';
import { FC, useState } from 'react';
import { MarkdownReader } from '../markdown-reader';

interface ViewPasswordSheetProps {
    password: Password;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const ViewPasswordSheet: FC<ViewPasswordSheetProps> = ({ password, open, setOpen }) => {
    const [showPassword, setShowPassword] = useState(false);
    const { handleCopy } = usePasswords();
    const { openSheet: openEditSheet } = useEditPassword();
    const { openDialog: openDeleteDialog } = useDeletePassword();

    const renderPasswordStrength = () => {
        let color = 'text-destructive';
        if (password.password_power?.score && password.password_power?.score >= 95) {
            color = 'text-emerald-700';
        } else if (password.password_power?.score && password.password_power?.score >= 90) {
            color = 'text-emerald-500';
        } else if (password.password_power?.score && password.password_power?.score >= 80) {
            color = 'text-green-500';
        } else if (password.password_power?.score && password.password_power?.score >= 60) {
            color = 'text-orange-500';
        }

        return (
            <>
                <ShieldCheck className={cn('size-4', color)} />
                <span className={cn('text-xs font-bold italic', color)}>{password.password_power?.label}</span>
            </>
        );
    };

    const handleEditPassword = () => {
        setOpen(false);
        openEditSheet(password);
    };

    const handleDeletePassword = () => {
        setOpen(false);
        openDeleteDialog(password);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="w-full overflow-y-auto pb-8 sm:max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()} aria-hidden={false}>
                <SheetHeader>
                    <SheetTitle>
                        <span className="flex items-center gap-2">
                            <LockKeyhole className="size-4" />
                            <span className="font-semibold">Password Details</span>
                        </span>
                    </SheetTitle>
                    <SheetDescription>View the details of the password and its associated data performing actions.</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col items-center gap-4 px-4 select-none">
                    <div className="flex w-full items-center justify-center gap-2">
                        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-sm">
                            {password.type === 'ssh' ? <Terminal className="size-4" /> : <KeyRound className="size-4" />}
                        </span>
                        <h3 className="text-center text-lg font-semibold capitalize">{password.name}</h3>

                        <div className="ml-auto flex items-center justify-center gap-2">
                            <Button variant="outline" size="icon" asChild>
                                <Link href={route('passwords.audit-logs.index', { password_id: password.id })}>
                                    <History />
                                </Link>
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleEditPassword}>
                                <Edit />
                            </Button>
                            <Button variant="destructive-outline" size="icon" onClick={handleDeletePassword}>
                                <Trash2 />
                            </Button>
                        </div>
                    </div>

                    <div className="border-border bg-background mt-4 flex w-full flex-col items-center justify-center divide-y rounded-md border p-4">
                        <ViewPanel
                            label="Username"
                            value={password.username}
                            icon={User}
                            actions={
                                <Button variant="ghost" size="icon" onClick={() => handleCopy('username', password)}>
                                    <Copy />
                                </Button>
                            }
                        />
                        {password.type === 'ssh' && (
                            <ViewPanel
                                label="CLI"
                                icon={Terminal}
                                value={password.cli!}
                                actions={
                                    <Button variant="ghost" size="icon" onClick={() => handleCopy('cli', password)}>
                                        <Copy />
                                    </Button>
                                }
                            />
                        )}
                        <ViewPanel
                            label="Password"
                            icon={KeyRound}
                            valueContent={
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-bold italic">{showPassword ? password.password : '****************'}</span>
                                    <div className="flex items-center gap-2">{renderPasswordStrength()}</div>
                                </div>
                            }
                            actions={
                                <>
                                    <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleCopy('password', password)}>
                                        <Copy />
                                    </Button>
                                </>
                            }
                        />
                        {password.type === 'normal' && (
                            <ViewPanel
                                label="URL"
                                icon={LinkIcon}
                                valueContent={
                                    <a
                                        href={password.url!}
                                        target="_blank"
                                        className="truncate text-sm font-bold italic hover:underline"
                                        rel="noopener noreferrer"
                                    >
                                        {password.url}
                                    </a>
                                }
                                actions={
                                    password.url && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => handleCopy('url', password)}>
                                                <Copy />
                                            </Button>
                                        </>
                                    )
                                }
                            />
                        )}

                        <ViewPanel label="Folder" icon={Folder} value={password.folder?.name || '-'} />
                        <ViewPanel
                            label="Expires at"
                            icon={Timer}
                            valueContent={
                                <p className="flex items-center gap-2 text-sm font-bold italic">
                                    {password.expires_at ? new Date(password.expires_at).toLocaleDateString() : '-'}
                                    {password.is_expired && (
                                        <span className="text-destructive flex items-center gap-1 text-xs">
                                            (Expired {password.expires_at_formatted}) <TimerOff className="size-4" />
                                        </span>
                                    )}
                                    {password.is_expired_soon && (
                                        <span className="text-warning flex items-center gap-1 text-xs">
                                            (Expiring soon {password.expires_at_formatted}) <Timer className="size-4" />
                                        </span>
                                    )}
                                </p>
                            }
                        />
                        <ViewPanel
                            label="Notes"
                            icon={StickyNote}
                            className="h-fit items-start [&>*:nth-child(2)]:items-start"
                            valueContent={password.notes ? <MarkdownReader>{password.notes}</MarkdownReader> : <></>}
                            actions={
                                password.notes ? (
                                    <Button variant="ghost" size="icon" onClick={() => handleCopy('notes', password)}>
                                        <Copy />
                                    </Button>
                                ) : (
                                    <></>
                                )
                            }
                        />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
