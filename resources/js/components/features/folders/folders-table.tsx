import { TableBody, TableCaption } from '@/components/ui/table';
import { Folder, FolderSortKey } from '@/types/folders';
import { FolderTableRow } from './folder-table-row';
import { FoldersTableHeader } from './folders-table-header';

interface FoldersTableProps {
    folders: Folder[];
    sortKey?: FolderSortKey;
    sortDirection?: 'asc' | 'desc';
    onSortChange: (key: FolderSortKey) => void;
    selectedFolderIds: Set<number>;
    onSelectAll: () => void;
    onSelectFolder: (folderId: number) => void;
    isAllSelected: boolean;
    isIndeterminate: boolean;
}

export function FoldersTable({
    folders,
    sortKey,
    sortDirection,
    onSortChange,
    selectedFolderIds,
    onSelectAll,
    onSelectFolder,
    isAllSelected,
    isIndeterminate,
}: FoldersTableProps) {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border mt-8 max-h-[calc(100%-180px)] overflow-auto rounded-md border md:max-h-[calc(100%-120px)]">
            <div className="relative w-full">
                <table className="w-full caption-bottom text-sm select-none">
                    {!folders.length && <TableCaption className="text-muted-foreground my-4 text-sm">No folders found.</TableCaption>}

                    <FoldersTableHeader
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        isAllSelected={isAllSelected}
                        isIndeterminate={isIndeterminate}
                        onSelectAll={onSelectAll}
                    />

                    <TableBody>
                        {folders.map((folder) => (
                            <FolderTableRow
                                key={folder.id}
                                folder={folder}
                                isSelected={selectedFolderIds.has(folder.id)}
                                onSelectionChange={() => onSelectFolder(folder.id)}
                            />
                        ))}
                    </TableBody>
                </table>
            </div>
        </div>
    );
}
