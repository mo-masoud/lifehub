import { Folder } from '@/types/folders';
import { useCallback, useMemo, useState } from 'react';

interface UseFolderSelectionProps {
    folders: Folder[];
}

export function useFolderSelection({ folders }: UseFolderSelectionProps) {
    const [selectedFolderIds, setSelectedFolderIds] = useState<Set<number>>(new Set());

    const handleSelectAll = useCallback(() => {
        if (selectedFolderIds.size === folders.length) {
            // If all are selected, deselect all
            setSelectedFolderIds(new Set());
        } else {
            // Otherwise select all
            setSelectedFolderIds(new Set(folders.map((folder) => folder.id)));
        }
    }, [folders, selectedFolderIds.size]);

    const handleSelectFolder = useCallback((folderId: number) => {
        setSelectedFolderIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    }, []);

    const isAllSelected = useMemo(() => {
        return folders.length > 0 && selectedFolderIds.size === folders.length;
    }, [folders.length, selectedFolderIds.size]);

    const isIndeterminate = useMemo(() => {
        return selectedFolderIds.size > 0 && selectedFolderIds.size < folders.length;
    }, [folders.length, selectedFolderIds.size]);

    return {
        selectedFolderIds,
        handleSelectAll,
        handleSelectFolder,
        isAllSelected,
        isIndeterminate,
        setSelectedFolderIds,
    };
}
