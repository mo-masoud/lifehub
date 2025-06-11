import { PasswordsHeader } from '@/components/features/passwords/passwords-header';
import { PasswordsSearchAndFilters } from '@/components/features/passwords/passwords-search-and-filters';
import { PasswordsTable } from '@/components/features/passwords/passwords-table';
import { PasswordStatsDashboard } from '@/components/features/passwords/stats';
import { TablePagination } from '@/components/shared/table-pagination';
import { useIsMobile } from '@/hooks';
import { usePasswordListState } from '@/hooks/passwords/use-password-list-state';
import { usePasswordSelection } from '@/hooks/passwords/use-password-selection';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Pagination, SharedData } from '@/types';
import { Password, PasswordFilters, PasswordStatsData } from '@/types/passwords';
import { Transition } from '@headlessui/react';
import { Head, usePage } from '@inertiajs/react';
import { ChangeEvent, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Passwords',
        href: '/passwords',
    },
];

interface PasswordsPageProps extends SharedData {
    passwords: Pagination<Password>;
    filters: PasswordFilters;
    stats: PasswordStatsData;
}

export default function PasswordsPage() {
    const isMobile = useIsMobile();

    const { passwords, filters, stats } = usePage<PasswordsPageProps>().props;
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        setShowStats(!isMobile);
    }, [isMobile]);

    // Use custom hooks for state management
    const {
        sortKey,
        sortDirection,
        search,
        folderId,
        type,
        perPage,
        expiryFilter,
        setSearch,
        setFolderId,
        setType,
        setPerPage,
        setExpiryFilter,
        handleSortChange,
    } = usePasswordListState({ initialFilters: filters });

    const { selectedPasswordIds, handleSelectAll, handleSelectPassword, isAllSelected, isIndeterminate } = usePasswordSelection({
        passwords: passwords.data,
    });

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        setSearch(value);
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
    };

    const handleToggleStats = () => {
        setShowStats(!showStats);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Passwords" />

            <div className="flex flex-col gap-4 rounded-md p-4">
                <PasswordsHeader selectedPasswordIds={selectedPasswordIds} showStats={showStats} onToggleStats={handleToggleStats} />

                {/* Password Statistics Dashboard */}
                <Transition
                    show={showStats}
                    as={'div'}
                    enter="transition-all duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-all duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <PasswordStatsDashboard stats={stats} />
                </Transition>

                <div className="flex flex-1 flex-col">
                    <PasswordsSearchAndFilters
                        search={search}
                        onSearchChange={handleSearchChange}
                        folderId={folderId}
                        onFolderIdChange={setFolderId}
                        type={type}
                        onTypeChange={setType}
                        expiryFilter={expiryFilter}
                        onExpiryFilterChange={setExpiryFilter}
                    />

                    <PasswordsTable
                        passwords={passwords.data}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        onSortChange={handleSortChange}
                        selectedPasswordIds={selectedPasswordIds}
                        onSelectAll={handleSelectAll}
                        onSelectPassword={handleSelectPassword}
                        isAllSelected={isAllSelected}
                        isIndeterminate={isIndeterminate}
                    />

                    {/* Pagination */}
                    <TablePagination
                        pagination={passwords}
                        className="mt-4"
                        currentFilters={{
                            sort: sortKey,
                            direction: sortDirection,
                            search: search || undefined,
                            folder_id: folderId !== 'all' ? folderId : undefined,
                            type: type || undefined,
                            expiry_filter: expiryFilter !== 'all' ? expiryFilter : undefined,
                        }}
                        routeName="passwords.index"
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
