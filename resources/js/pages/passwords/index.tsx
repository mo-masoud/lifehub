import Heading from '@/components/heading';
import { CreatePasswordSheet } from '@/components/passwords/create-password-sheet';
import { PasswordsFilter } from '@/components/passwords/passwords-filter';
import { PasswordsTableRow } from '@/components/passwords/passwords-table-row';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableBody, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, Pagination, SharedData } from '@/types';
import { Password } from '@/types/models';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, LockKeyhole, RefreshCcw, Search } from 'lucide-react';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

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

type SortKey = 'name' | 'username' | 'last_used_at';

type Filters = {
    folderId?: string;
    sort: SortKey;
    direction: 'asc' | 'desc';
    search?: string;
    type?: 'normal' | 'ssh';
    perPage?: number;
};

interface PasswordsPageProps extends SharedData {
    passwords: Pagination<Password>;
    filters: Filters;
}

export default function PasswordsPage() {
    const isInitialRender = useRef(true);

    const { passwords, filters } = usePage<PasswordsPageProps>().props;

    const [sortKey, setSortKey] = useState<SortKey>(filters.sort);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(filters.direction);
    const [search, setSearch] = useState<string>(filters.search || '');
    const [folderId, setFolderId] = useState<string>(filters.folderId || 'all');
    const [type, setType] = useState<'ssh' | 'normal' | undefined>(filters.type);
    const [perPage, setPerPage] = useState<number>(filters.perPage || 10);

    const handleSortChange = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('desc'); // Reset to default direction when changing sort key
        }
    };

    const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        setSearch(value);
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Passwords" />

            <div className="flex h-full flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Passwords" description="Manage your passwords securely." icon={LockKeyhole} />

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" asChild size="icon">
                            <Link href={route('passwords.index')} prefetch>
                                <RefreshCcw className="size-4" />
                            </Link>
                        </Button>
                        <CreatePasswordSheet>
                            <Button>Create</Button>
                        </CreatePasswordSheet>
                    </div>
                </div>

                <div className="relative flex flex-1 flex-col overflow-hidden">
                    <div className="absolute inset-0 size-full p-1">
                        {/* Search & Filters */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-500" />
                                <Input placeholder="Search passwords..." className="pl-10" value={search} onChange={handleSearch} />
                            </div>

                            <PasswordsFilter setFolderId={setFolderId} folderId={folderId} setType={setType} type={type} />
                        </div>

                        {/* Table */}
                        <div className="border-sidebar-border/70 dark:border-sidebar-border mt-8 max-h-[calc(100%-120px)] overflow-auto rounded-xl border">
                            <div className="relative w-full">
                                <table className="w-full caption-bottom text-sm select-none">
                                    {!passwords.data.length && (
                                        <TableCaption className="text-muted-foreground my-4 text-sm">No passwords found.</TableCaption>
                                    )}

                                    <TableHeader className="sticky top-0 z-15 bg-slate-50 dark:bg-slate-900">
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSortChange('name')}>
                                                <span className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase dark:text-slate-200">
                                                    Name
                                                    <ChevronDown
                                                        className={cn(
                                                            'size-4 transition-all duration-100 ease-in-out',
                                                            sortKey === 'name' ? 'opacity-85' : 'opacity-0',
                                                            sortDirection === 'asc' && 'rotate-180',
                                                        )}
                                                    />
                                                </span>
                                            </TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSortChange('username')}>
                                                <span className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase dark:text-slate-200">
                                                    Username
                                                    <ChevronDown
                                                        className={cn(
                                                            'size-4 transition-all duration-100 ease-in-out',
                                                            sortKey === 'username' ? 'opacity-85' : 'opacity-0',
                                                            sortDirection === 'asc' && 'rotate-180',
                                                        )}
                                                    />
                                                </span>
                                            </TableHead>
                                            <TableHead>
                                                <span className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase dark:text-slate-200">
                                                    Folder
                                                </span>
                                            </TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSortChange('last_used_at')}>
                                                <span className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase dark:text-slate-200">
                                                    Last used
                                                    <ChevronDown
                                                        className={cn(
                                                            'size-4 transition-all duration-100 ease-in-out',
                                                            sortKey === 'last_used_at' ? 'opacity-85' : 'opacity-0',
                                                            sortDirection === 'asc' && 'rotate-180',
                                                        )}
                                                    />
                                                </span>
                                            </TableHead>
                                            <TableHead className="text-end">
                                                <span className="sr-only">Actions</span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {passwords.data.map((password) => (
                                            <PasswordsTableRow key={password.id} password={password} />
                                        ))}
                                    </TableBody>
                                </table>
                            </div>
                        </div>

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
                            }}
                            routeName="passwords.index"
                            perPage={perPage}
                            onPerPageChange={handlePerPageChange}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
