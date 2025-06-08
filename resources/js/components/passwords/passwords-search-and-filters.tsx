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
    expiryFilter: 'all' | 'expired' | 'expires_soon';
    onExpiryFilterChange: (filter: 'all' | 'expired' | 'expires_soon') => void;
}

export const PasswordsSearchAndFilters: FC<PasswordsSearchAndFiltersProps> = ({
    search,
    onSearchChange,
    folderId,
    onFolderIdChange,
    type,
    onTypeChange,
    expiryFilter,
    onExpiryFilterChange,
}) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative w-full md:max-w-md">
                <Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
                <Input placeholder="Search passwords..." className="pl-10" value={search} onChange={onSearchChange} />
            </div>
            <PasswordFilters
                setFolderId={onFolderIdChange}
                folderId={folderId}
                setType={onTypeChange}
                type={type}
                expiryFilter={expiryFilter}
                setExpiryFilter={onExpiryFilterChange}
            />
        </div>
    );
};
