import { AuditLogsHeader } from '@/components/features/audit-logs/audit-logs-header';
import { AuditLogsSearchAndFilters } from '@/components/features/audit-logs/audit-logs-search-and-filters';
import { AuditLogsTable } from '@/components/features/audit-logs/audit-logs-table';
import { TablePagination } from '@/components/shared/table-pagination';
import { useAuditLogListState } from '@/hooks/audit-logs/use-audit-log-list-state';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Pagination, SharedData } from '@/types';
import { AuditLog, AuditLogFilters } from '@/types/audit-logs';
import { Head, usePage } from '@inertiajs/react';
import { ChangeEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Passwords',
        href: '/passwords',
    },
    {
        title: 'Audit Logs',
        href: '/passwords/audit-logs',
    },
];

interface AuditLogsPageProps extends SharedData {
    auditLogs: Pagination<AuditLog>;
    filters: AuditLogFilters;
    availableActions: Record<string, string>;
    userPasswords: Array<{ id: number; name: string }>;
}

export default function AuditLogsPage() {
    const { auditLogs, filters, availableActions, userPasswords } = usePage<AuditLogsPageProps>().props;

    // Use custom hooks for state management
    const {
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
    } = useAuditLogListState({ initialFilters: filters });

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        setSearch(value);
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />

            <div className="flex h-full flex-col gap-4 rounded-md p-4">
                <AuditLogsHeader />

                <div className="relative flex flex-1 flex-col">
                    <div className="absolute inset-0 size-full p-1">
                        <AuditLogsSearchAndFilters
                            search={search}
                            onSearchChange={handleSearchChange}
                            passwordId={passwordId}
                            onPasswordIdChange={setPasswordId}
                            action={action}
                            onActionChange={setAction}
                            startDate={startDate}
                            onStartDateChange={setStartDate}
                            endDate={endDate}
                            onEndDateChange={setEndDate}
                            userPasswords={userPasswords}
                            availableActions={availableActions}
                        />

                        <AuditLogsTable auditLogs={auditLogs.data} sortKey={sortKey} sortDirection={sortDirection} onSortChange={handleSortChange} />

                        {/* Pagination */}
                        <TablePagination
                            pagination={auditLogs}
                            className="mt-4"
                            currentFilters={{
                                sort: sortKey,
                                direction: sortDirection,
                                search: search || undefined,
                                password_id: passwordId,
                                action: action || undefined,
                                start_date: startDate || undefined,
                                end_date: endDate || undefined,
                            }}
                            routeName="passwords.audit-logs.index"
                            perPage={perPage}
                            onPerPageChange={handlePerPageChange}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
