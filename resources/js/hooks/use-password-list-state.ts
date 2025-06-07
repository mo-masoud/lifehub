import { PasswordFilters, PasswordType, SortDirection, SortKey } from '@/types/passwords';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePasswordListStateProps {
    initialFilters: PasswordFilters;
}

export function usePasswordListState({ initialFilters }: UsePasswordListStateProps) {
    const isInitialRender = useRef(true);

    const [sortKey, setSortKey] = useState<SortKey>(initialFilters.sort);
    const [sortDirection, setSortDirection] = useState<SortDirection>(initialFilters.direction);
    const [search, setSearch] = useState<string>(initialFilters.search || '');
    const [folderId, setFolderId] = useState<string>(initialFilters.folderId || 'all');
    const [type, setType] = useState<PasswordType | undefined>(initialFilters.type);
    const [perPage, setPerPage] = useState<number>(initialFilters.perPage || 10);

    const handleSortChange = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection((prev: SortDirection) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('desc'); // Reset to default direction when changing sort key
        }
    };

    const handleFilters = useCallback(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        const data: Record<string, string | number | boolean | undefined | null> = {};

        if (sortKey) {
            data.sort = sortKey;
        }

        if (sortDirection) {
            data.direction = sortDirection;
        }

        if (search) {
            data.search = search.trim();
        }

        if (folderId !== undefined) {
            data.folder_id = folderId;
        }

        if (type) {
            data.type = type;
        }

        if (perPage && perPage !== 10) {
            data.per_page = perPage;
        }

        router.visit(route('passwords.index', data), {
            method: 'get',
            preserveState: true,
            preserveScroll: true,
        });
    }, [sortKey, sortDirection, search, folderId, type, perPage]);

    useEffect(() => {
        handleFilters();
    }, [handleFilters]);

    return {
        sortKey,
        sortDirection,
        search,
        folderId,
        type,
        perPage,
        setSearch,
        setFolderId,
        setType,
        setPerPage,
        handleSortChange,
    };
}
