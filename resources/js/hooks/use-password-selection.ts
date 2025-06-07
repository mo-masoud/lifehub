import { Password } from '@/types/models';
import { useEffect, useState } from 'react';

interface UsePasswordSelectionProps {
    passwords: Password[];
}

export function usePasswordSelection({ passwords }: UsePasswordSelectionProps) {
    const [selectedPasswordIds, setSelectedPasswordIds] = useState<Set<number>>(new Set());

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedPasswordIds(new Set(passwords.map((p) => p.id)));
        } else {
            setSelectedPasswordIds(new Set());
        }
    };

    const handleSelectPassword = (passwordId: number, checked: boolean) => {
        const newSelected = new Set(selectedPasswordIds);
        if (checked) {
            newSelected.add(passwordId);
        } else {
            newSelected.delete(passwordId);
        }
        setSelectedPasswordIds(newSelected);
    };

    const isAllSelected = passwords.length > 0 && selectedPasswordIds.size === passwords.length;
    const isIndeterminate = selectedPasswordIds.size > 0 && selectedPasswordIds.size < passwords.length;

    // Clear selection when passwords change (e.g., page change, filter change)
    useEffect(() => {
        setSelectedPasswordIds(new Set());
    }, [passwords]);

    return {
        selectedPasswordIds,
        handleSelectAll,
        handleSelectPassword,
        isAllSelected,
        isIndeterminate,
    };
}
