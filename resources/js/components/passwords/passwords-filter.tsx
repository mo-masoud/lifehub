import { FoldersCombobox } from '@/components/folders/folders-combobox';
import { useIsMobile } from '@/hooks/use-mobile';
import { Folder } from '@/types/models';
import { KeyRound, RectangleEllipsis, Terminal, TimerOff, TriangleAlert } from 'lucide-react';
import { FC, useState } from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface PasswordsFilterProps {
    folders: Folder[];
    expirySoonCount: number;
    expiredCount: number;
    setFolderId: (folderId: string) => void;
    folderId: string;
}

export const PasswordsFilter: FC<PasswordsFilterProps> = ({ folders, expirySoonCount, expiredCount, setFolderId, folderId }) => {
    const isMobile = useIsMobile();

    const [passwordType, setPasswordType] = useState<string>('all');

    const renderPasswordTypeIcon = () => {
        switch (passwordType) {
            case 'normal':
                return <KeyRound className="text-rose-700" />;
            case 'ssh':
                return <Terminal className="text-green-700" />;
            case 'all':
                return <RectangleEllipsis className="text-sky-700" />;
            default:
                return <RectangleEllipsis className="text-sky-700" />;
        }
    };

    return (
        <div className="flex items-center justify-between gap-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        {renderPasswordTypeIcon()}
                        <span className="sr-only">Filter passwords</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-28" align="end">
                    <DropdownMenuRadioGroup value={passwordType} onValueChange={setPasswordType}>
                        <DropdownMenuRadioItem value="all" className="[&&>span]:text-sky-700">
                            <span className="flex items-center justify-end gap-2">
                                <RectangleEllipsis />
                                All
                            </span>
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="normal" className="[&&>span]:text-rose-700">
                            <span className="flex items-center justify-end gap-2">
                                <KeyRound />
                                Normal
                            </span>
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="ssh" className="[&&>span]:text-green-700">
                            <span className="flex items-center justify-end gap-2">
                                <Terminal />
                                SSH
                            </span>
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {expirySoonCount > 0 && (
                <Button variant="warning-outline" size={isMobile ? 'icon' : 'default'}>
                    <span className="hidden md:block">Expiry soon</span>
                    <TriangleAlert className="md:hidden" />
                    <span className="bg-warning text-warning-foreground hidden size-5 items-center justify-center rounded-full p-1 text-[11px] font-bold md:inline-flex">
                        {expirySoonCount > 9 ? '9+' : expirySoonCount}
                    </span>
                </Button>
            )}
            {expiredCount > 0 && (
                <Button variant="destructive-outline" size={isMobile ? 'icon' : 'default'}>
                    <span className="hidden md:block">Expired</span>
                    <TimerOff className="md:hidden" />

                    <span className="bg-destructive text-muted hidden size-5 items-center justify-center rounded-full p-1 text-[11px] font-bold md:inline-flex">
                        {expiredCount > 9 ? '9+' : expiredCount}
                    </span>
                </Button>
            )}

            <FoldersCombobox folders={folders} onSelectFolder={setFolderId} selectedFolder={folderId} />
        </div>
    );
};
