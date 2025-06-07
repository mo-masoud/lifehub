import { FoldersCombobox } from '@/components/folders/folders-combobox';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PasswordType } from '@/types/passwords';
import { KeyRound, List, Terminal, Timer } from 'lucide-react';
import { FC } from 'react';

interface PasswordFiltersProps {
    setType: (type: PasswordType | undefined) => void;
    type: PasswordType | undefined;
    setFolderId: (folderId: string) => void;
    folderId: string;
    showExpired: boolean;
    setShowExpired: (show: boolean) => void;
    showExpiresSoon: boolean;
    setShowExpiresSoon: (show: boolean) => void;
}

export const PasswordFilters: FC<PasswordFiltersProps> = ({
    setFolderId,
    folderId,
    setType,
    type,
    showExpired,
    setShowExpired,
    showExpiresSoon,
    setShowExpiresSoon,
}) => {
    const renderPasswordTypeIcon = () => {
        switch (type) {
            case 'normal':
                return <KeyRound />;
            case 'ssh':
                return <Terminal />;
            default:
                return <List />;
        }
    };

    return (
        <div className="flex items-center gap-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        {renderPasswordTypeIcon()}
                        <span className="sr-only">Filter passwords</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-28" align="end">
                    <DropdownMenuRadioGroup
                        value={type || 'all'}
                        onValueChange={(value) => setType(value === 'all' ? undefined : (value as PasswordType))}
                    >
                        <DropdownMenuRadioItem value="all">
                            <span className="flex items-center justify-end gap-2">
                                <List />
                                All
                            </span>
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="normal">
                            <span className="flex items-center justify-end gap-2">
                                <KeyRound />
                                Normal
                            </span>
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="ssh">
                            <span className="flex items-center justify-end gap-2">
                                <Terminal />
                                SSH
                            </span>
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Timer />
                        <span className="sr-only">Filter by expiry</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <div className="space-y-2 p-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="show_expired" checked={showExpired} onCheckedChange={setShowExpired} />
                            <label
                                htmlFor="show_expired"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Show expired passwords
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="show_expires_soon" checked={showExpiresSoon} onCheckedChange={setShowExpiresSoon} />
                            <label
                                htmlFor="show_expires_soon"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Show expiring soon
                            </label>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-full md:w-[200px]">
                <FoldersCombobox onSelectFolder={setFolderId} selectedFolder={folderId} />
            </div>
        </div>
    );
};
