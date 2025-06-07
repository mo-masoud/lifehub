import { ActionType, AuditLogFilters, SortDirection, SortKey } from '@/types/audit-logs';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAuditLogListStateProps {
    initialFilters: AuditLogFilters;
}

export function useAuditLogListState({ initialFilters }: UseAuditLogListStateProps) {
    const isInitialRender = useRef(true);

    const [sortKey, setSortKey] = useState<SortKey>(initialFilters.sort);
    const [sortDirection, setSortDirection] = useState<SortDirection>(initialFilters.direction);
    const [search, setSearch] = useState<string>(initialFilters.search || '');
    const [passwordId, setPasswordId] = useState<number | undefined>(initialFilters.passwordId);
    const [action, setAction] = useState<ActionType | undefined>(initialFilters.action);
    const [startDate, setStartDate] = useState<string>(initialFilters.startDate || '');
    const [endDate, setEndDate] = useState<string>(initialFilters.endDate || '');
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

        if (passwordId !== undefined) {
            data.password_id = passwordId;
        }

        if (action) {
            data.action = action;
        }

        if (startDate) {
            data.start_date = startDate;
        }

        if (endDate) {
            data.end_date = endDate;
        }

        if (perPage && perPage !== 10) {
            data.per_page = perPage;
        }

        router.visit(route('passwords.audit-logs.index', data), {
            method: 'get',
            preserveState: true,
            preserveScroll: true,
        });
    }, [sortKey, sortDirection, search, passwordId, action, startDate, endDate, perPage]);

    useEffect(() => {
        handleFilters();
    }, [handleFilters]);

    return {
        sortKey,
        sortDirection,
        search,
        passwordId,
        action,
        startDate,
        endDate,
        perPage,
        setSearch,
        setPasswordId,
        setAction,
        setStartDate,
        setEndDate,
        setPerPage,
        handleSortChange,
    };
}
