import { FoldersCombobox } from '@/components/folders/folders-combobox';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { KeyRound, RectangleEllipsis, Terminal } from 'lucide-react';
import { FC } from 'react';

interface PasswordsFilterProps {
    setType: (type: 'ssh' | 'normal' | undefined) => void;
    type: 'ssh' | 'normal' | undefined;
    setFolderId: (folderId: string) => void;
    folderId: string;
}

export const PasswordsFilter: FC<PasswordsFilterProps> = ({ setFolderId, folderId, setType, type }) => {
    const renderPasswordTypeIcon = () => {
        switch (type) {
            case 'normal':
                return <KeyRound className="text-rose-700" />;
            case 'ssh':
                return <Terminal className="text-green-700" />;
            default:
                return <RectangleEllipsis className="text-sky-700" />;
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
                        onValueChange={(value) => setType(value === 'all' ? undefined : (value as 'ssh' | 'normal'))}
                    >
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

            <div className="w-[200px]">
                <FoldersCombobox onSelectFolder={setFolderId} selectedFolder={folderId} />
            </div>
        </div>
    );
};
