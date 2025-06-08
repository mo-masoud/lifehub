import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ChangeEvent, FC } from 'react';

interface FoldersSearchAndFiltersProps {
    search: string;
    onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const FoldersSearchAndFilters: FC<FoldersSearchAndFiltersProps> = ({ search, onSearchChange }) => {
    return (
        <div className="flex items-center gap-4">
            <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input placeholder="Search folders..." value={search} onChange={onSearchChange} className="pl-10" autoComplete="off" />
            </div>
        </div>
    );
};
