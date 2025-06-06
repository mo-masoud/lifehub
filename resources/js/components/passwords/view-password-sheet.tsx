import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ViewPanel } from '@/components/view-panel';
import { cn } from '@/lib/utils';
import { Password } from '@/types/models';
import {
    Copy,
    Edit,
    Eye,
    EyeOff,
    Folder,
    History,
    KeyRound,
    Link,
    LockKeyhole,
    ShieldCheck,
    StickyNote,
    Terminal,
    Timer,
    TimerOff,
    Trash,
    User,
} from 'lucide-react';
import { FC, useState } from 'react';
import { MarkdownReader } from '../markdown-reader';
import { SharePassword } from './share-password';

interface ViewPasswordSheetProps {
    password: Password;
    children: React.ReactNode;
}

export const ViewPasswordSheet: FC<ViewPasswordSheetProps> = ({ password, children }) => {
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild onClick={() => setOpen(true)}>
                {children}
            </SheetTrigger>
            <SheetContent className="overflow-y-auto pb-8 sm:max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()} aria-hidden={false}>
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
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                'flex size-8 items-center justify-center rounded-xl text-white',
                                password.type === 'ssh' ? 'bg-green-700' : 'bg-rose-700',
                            )}
                        >
                            {password.type === 'ssh' ? <Terminal className="size-4" /> : <KeyRound className="size-4" />}
                        </span>
                        <h3 className="text-center text-lg font-semibold capitalize">{password.name}</h3>
                    </div>

                    <div className="mt-4 flex w-full items-center justify-between gap-4">
                        <SharePassword />
                        <Button variant="outline" className="w-full">
                            <History />
                            History
                        </Button>
                    </div>

                    <div className="border-border bg-background mt-4 flex w-full flex-col items-center justify-center divide-y rounded-lg border p-4">
                        <ViewPanel
                            label="Username"
                            value={password.username}
                            icon={User}
                            iconClassName="text-orange-600"
                            actions={
                                <Button variant="ghost" size="icon">
                                    <Copy />
                                </Button>
                            }
                        />
                        {password.type === 'ssh' && (
                            <ViewPanel
                                label="CLI"
                                icon={Terminal}
                                iconClassName="text-green-600"
                                value={password.cli!}
                                actions={
                                    <Button variant="ghost" size="icon">
                                        <Copy />
                                    </Button>
                                }
                            />
                        )}
                        <ViewPanel
                            label="Password"
                            icon={KeyRound}
                            iconClassName="text-rose-600"
                            valueContent={
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-bold italic">{showPassword ? password.password : '****************'}</span>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="size-4" />
                                        <span
                                            className={cn(
                                                'text-xs font-semibold italic',
                                                password.password_power?.score && password.password_power?.score >= 95
                                                    ? 'text-green-500'
                                                    : password.password_power?.score && password.password_power?.score >= 90
                                                      ? 'text-green-500'
                                                      : password.password_power?.score && password.password_power?.score >= 80
                                                        ? 'text-yellow-500'
                                                        : password.password_power?.score && password.password_power?.score >= 60
                                                          ? 'text-orange-500'
                                                          : 'text-red-500',
                                            )}
                                        >
                                            {password.password_power?.label}
                                        </span>
                                    </div>
                                </div>
                            }
                            actions={
                                <>
                                    <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <Copy />
                                    </Button>
                                </>
                            }
                        />
                        {password.type === 'normal' && (
                            <ViewPanel
                                label="URL"
                                icon={Link}
                                iconClassName="text-blue-600"
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
                                    <Button variant="ghost" size="icon">
                                        <Copy />
                                    </Button>
                                }
                            />
                        )}

                        <ViewPanel label="Folder" icon={Folder} iconClassName="text-sky-600" value={password.folder?.name || '-'} />
                        <ViewPanel
                            label="Expires at"
                            icon={Timer}
                            iconClassName="text-yellow-400"
                            valueContent={
                                <p className="flex items-center gap-2 text-sm font-bold italic">
                                    {password.expires_at ? new Date(password.expires_at).toLocaleDateString() : '-'}
                                    {password.is_expired && (
                                        <span className="flex items-center gap-1 text-xs text-red-500">
                                            (Expired {password.expires_at_formatted}) <TimerOff className="size-4" />
                                        </span>
                                    )}
                                    {password.is_expired_soon && (
                                        <span className="flex items-center gap-1 text-xs text-yellow-500">
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
                            iconClassName="text-yellow-600"
                            valueContent={password.notes ? <MarkdownReader>{password.notes}</MarkdownReader> : <></>}
                            actions={
                                password.notes ? (
                                    <Button variant="ghost" size="icon">
                                        <Copy />
                                    </Button>
                                ) : (
                                    <></>
                                )
                            }
                        />
                    </div>
                </div>

                <SheetFooter className="flex flex-row items-center justify-between gap-4">
                    <Button variant="outline" className="w-full">
                        <Edit />
                        Edit
                    </Button>
                    <Button variant="destructive" className="w-full">
                        <Trash />
                        Delete
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
