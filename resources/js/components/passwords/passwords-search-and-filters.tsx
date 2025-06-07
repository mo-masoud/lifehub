import { Input } from '@/components/ui/input';
import { PasswordType } from '@/types/passwords';
import { Search } from 'lucide-react';
import { ChangeEvent, FC } from 'react';
import { PasswordFilters } from './password-filters';

interface PasswordsSearchAndFiltersProps {
    search: string;
    onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
    folderId: string;
    onFolderIdChange: (folderId: string) => void;
    type: PasswordType | undefined;
    onTypeChange: (type: PasswordType | undefined) => void;
    showExpired: boolean;
    onShowExpiredChange: (show: boolean) => void;
    showExpiresSoon: boolean;
    onShowExpiresSoonChange: (show: boolean) => void;
}

export const PasswordsSearchAndFilters: FC<PasswordsSearchAndFiltersProps> = ({
    search,
    onSearchChange,
    folderId,
    onFolderIdChange,
    type,
    onTypeChange,
    showExpired,
    onShowExpiredChange,
    showExpiresSoon,
    onShowExpiresSoonChange,
}) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative w-full max-w-md">
                <Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
                <Input placeholder="Search passwords..." className="pl-10" value={search} onChange={onSearchChange} />
            </div>
            <PasswordFilters
                setFolderId={onFolderIdChange}
                folderId={folderId}
                setType={onTypeChange}
                type={type}
                showExpired={showExpired}
                setShowExpired={onShowExpiredChange}
                showExpiresSoon={showExpiresSoon}
                setShowExpiresSoon={onShowExpiresSoonChange}
            />
        </div>
    );
};
