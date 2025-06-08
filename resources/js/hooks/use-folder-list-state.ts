import { FolderFilters, FolderSortKey } from '@/types/folders';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

interface UseFolderListStateProps {
    initialFilters: FolderFilters;
}

export function useFolderListState({ initialFilters }: UseFolderListStateProps) {
    const [sortKey, setSortKey] = useState<FolderSortKey | undefined>(initialFilters.sort);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>(initialFilters.direction);
    const [search, setSearch] = useState<string>(initialFilters.search || '');
    const [perPage, setPerPage] = useState<number>(initialFilters.per_page || 10);
    const [featured, setFeatured] = useState<'all' | 'featured' | 'not_featured'>(initialFilters.featured || 'all');

    const updateFilters = useCallback(() => {
        const params: Record<string, string | number | undefined> = {
            search: search || undefined,
            sort: sortKey,
            direction: sortDirection,
            per_page: perPage !== 10 ? perPage : undefined,
            featured: featured !== 'all' ? featured : undefined,
        };

        // Remove undefined values
        const filteredParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));

        router.get(route('folders.index'), filteredParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [search, sortKey, sortDirection, perPage, featured]);

    const handleSortChange = (newSortKey: FolderSortKey) => {
        if (newSortKey === sortKey) {
            // If sorting by the same key, toggle direction
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // If sorting by a new key, set to ascending
            setSortKey(newSortKey);
            setSortDirection('asc');
        }
    };

    // Debounced filter updates
    useEffect(() => {
        const timer = setTimeout(
            () => {
                updateFilters();
            },
            search ? 300 : 0,
        ); // Debounce search, immediate for other filters

        return () => clearTimeout(timer);
    }, [search, sortKey, sortDirection, perPage, featured, updateFilters]);

    return {
        sortKey,
        sortDirection,
        search,
        perPage,
        featured,
        setSearch,
        setPerPage,
        setFeatured,
        handleSortChange,
    };
}
