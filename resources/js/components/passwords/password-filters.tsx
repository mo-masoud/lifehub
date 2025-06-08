import { FoldersCombobox } from '@/components/folders/folders-combobox';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PasswordType } from '@/types/passwords';
import { KeyRound, List, Terminal, Timer } from 'lucide-react';
import { FC } from 'react';

interface PasswordFiltersProps {
    setType: (type: PasswordType | undefined) => void;
    type: PasswordType | undefined;
    setFolderId: (folderId: string) => void;
    folderId: string;
    expiryFilter: 'all' | 'expired' | 'expires_soon';
    setExpiryFilter: (filter: 'all' | 'expired' | 'expires_soon') => void;
}

export const PasswordFilters: FC<PasswordFiltersProps> = ({ setFolderId, folderId, setType, type, expiryFilter, setExpiryFilter }) => {
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
                    <DropdownMenuRadioGroup
                        value={expiryFilter}
                        onValueChange={(value) => setExpiryFilter(value as 'all' | 'expired' | 'expires_soon')}
                    >
                        <DropdownMenuRadioItem value="all">All passwords</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="expired">Expired only</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="expires_soon">Expiring soon only</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-full md:w-[200px]">
                <FoldersCombobox onSelectFolder={setFolderId} selectedFolder={folderId} />
            </div>
        </div>
    );
};
