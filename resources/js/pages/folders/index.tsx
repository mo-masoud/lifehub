import { FoldersHeader } from '@/components/folders/folders-header';
import { FoldersSearchAndFilters } from '@/components/folders/folders-search-and-filters';
import { FoldersTable } from '@/components/folders/folders-table';
import { TablePagination } from '@/components/table-pagination';
import { useFolderListState } from '@/hooks/use-folder-list-state';
import { useFolderSelection } from '@/hooks/use-folder-selection';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Pagination, SharedData } from '@/types';
import { Folder, FolderFilters } from '@/types/folders';
import { Head, usePage } from '@inertiajs/react';
import { ChangeEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Folders',
        href: '/folders',
    },
];

interface FoldersPageProps extends SharedData {
    folders: Pagination<Folder>;
    filters: FolderFilters;
}

export default function FoldersPage() {
    const { folders, filters } = usePage<FoldersPageProps>().props;

    // Use custom hooks for state management
    const { sortKey, sortDirection, search, perPage, featured, setSearch, setPerPage, setFeatured, handleSortChange } = useFolderListState({
        initialFilters: filters,
    });

    const { selectedFolderIds, handleSelectAll, handleSelectFolder, isAllSelected, isIndeterminate } = useFolderSelection({
        folders: folders.data,
    });

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        setSearch(value);
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Folders" />

            <div className="flex h-full flex-col gap-4 rounded-md p-4">
                <FoldersHeader selectedFolderIds={selectedFolderIds} />

                <div className="relative flex flex-1 flex-col">
                    <div className="absolute inset-0 size-full p-1">
                        <FoldersSearchAndFilters search={search} onSearchChange={handleSearchChange} featured={featured} setFeatured={setFeatured} />

                        <FoldersTable
                            folders={folders.data}
                            sortKey={sortKey}
                            sortDirection={sortDirection}
                            onSortChange={handleSortChange}
                            selectedFolderIds={selectedFolderIds}
                            onSelectAll={handleSelectAll}
                            onSelectFolder={handleSelectFolder}
                            isAllSelected={isAllSelected}
                            isIndeterminate={isIndeterminate}
                        />

                        {/* Pagination */}
                        <TablePagination
                            pagination={folders}
                            className="mt-4"
                            currentFilters={{
                                sort: sortKey,
                                direction: sortDirection,
                                search: search || undefined,
                                featured: featured !== 'all' ? featured : undefined,
                            }}
                            routeName="folders.index"
                            perPage={perPage}
                            onPerPageChange={handlePerPageChange}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
