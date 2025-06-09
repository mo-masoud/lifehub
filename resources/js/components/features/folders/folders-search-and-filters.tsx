import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ChangeEvent } from 'react';
import { FolderFilters } from './folder-filters';

interface FoldersSearchAndFiltersProps {
    search: string;
    onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
    featured: 'all' | 'featured' | 'not_featured';
    setFeatured: (featured: 'all' | 'featured' | 'not_featured') => void;
}

export function FoldersSearchAndFilters({ search, onSearchChange, featured, setFeatured }: FoldersSearchAndFiltersProps) {
    return (
        <div className="flex w-full items-center justify-between gap-4">
            <div className="relative max-w-full flex-1 md:max-w-sm">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input placeholder="Search folders..." value={search} onChange={onSearchChange} className="pl-10" autoComplete="off" />
            </div>

            <FolderFilters featured={featured} setFeatured={setFeatured} />
        </div>
    );
}
