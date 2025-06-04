import Heading from '@/components/heading';
import { PasswordsFilter } from '@/components/passwords/passwords-filter';
import { PasswordsTableRow } from '@/components/passwords/passwords-table-row';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { TableBody, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, Pagination, SharedData } from '@/types';
import { Folder, Password } from '@/types/models';
import { Transition } from '@headlessui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { ChartArea, ChevronDown, Cog, Filter, LockKeyhole, Search } from 'lucide-react';

import { ChangeEvent, useEffect, useRef, useState } from 'react';

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
    folderId?: number | null;
    sort: SortKey;
    direction: 'asc' | 'desc';
    search?: string;
    expirySoon?: boolean;
    expired?: boolean;
    type?: 'normal' | 'ssh';
    perPage?: number;
};

interface PasswordsPageProps extends SharedData {
    passwords: Pagination<Password>;
    folders: Folder[];
    expirySoonCount: number;
    expiredCount: number;
    filters: Filters;
}

export default function PasswordsPage() {
    const isInitialRender = useRef(true);
    const isMobile = useIsMobile();

    const { passwords, folders, expirySoonCount, expiredCount, filters } = usePage<PasswordsPageProps>().props;

    const [showCharts, setShowCharts] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const [sortKey, setSortKey] = useState<SortKey>(filters.sort);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(filters.direction);
    const [search, setSearch] = useState<string>(filters.search || '');

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

    const handleFilters = () => {
        const data: Partial<Filters> = {};

        if (sortKey) {
            data.sort = sortKey;
        }

        if (sortDirection) {
            data.direction = sortDirection;
        }

        if (search) {
            data.search = search.trim();
        }

        if (filters.folderId) {
            data.folderId = filters.folderId;
        }

        if (filters.expirySoon) {
            data.expirySoon = filters.expirySoon;
        }

        if (filters.expired) {
            data.expired = filters.expired;
        }

        if (filters.type) {
            data.type = filters.type;
        }

        if (filters.perPage && filters.perPage !== 10) {
            data.perPage = filters.perPage;
        }

        router.visit(route('passwords.index', data), {
            method: 'get',
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        handleFilters();
    }, [sortKey, sortDirection, search]);

    useEffect(() => {
        setShowCharts(!isMobile);
        setShowFilters(!isMobile);
    }, [isMobile]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Passwords" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Passwords"
                        description="Manage your passwords securely."
                        icon={LockKeyhole}
                        iconClassName="text-sky-700 dark:text-sky-400"
                    />

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Cog className="size-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48" align="end">
                                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem checked={showCharts} onCheckedChange={setShowCharts}>
                                    <span>Show Charts</span>
                                    <ChartArea className="ml-auto" />
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={showFilters} onCheckedChange={setShowFilters}>
                                    <span>Show Filters</span>
                                    <Filter className="ml-auto" />
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button>Create</Button>
                    </div>
                </div>
                <Transition
                    show={showCharts}
                    enter="transition ease-out duration-300"
                    enterFrom="opacity-0 transform -translate-y-4"
                    enterTo="opacity-100 transform translate-y-0"
                    leave="transition ease-in duration-200"
                    leaveFrom="opacity-100 transform translate-y-0"
                    leaveTo="opacity-0 transform -translate-y-4"
                >
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </div>
                </Transition>
                <div className="relative mt-4 flex min-h-[100vh] flex-1 flex-col overflow-hidden md:min-h-min">
                    <div className="absolute inset-0 size-full p-1">
                        {/* Search & Filters */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-500" />
                                <Input placeholder="Search passwords..." className="pl-10" value={search} onChange={handleSearch} />
                            </div>

                            <Transition
                                show={showFilters}
                                enter="transition ease-out duration-300"
                                enterFrom="opacity-0 transform translate-x-4"
                                enterTo="opacity-100 transform translate-x-0"
                                leave="transition ease-in duration-200"
                                leaveFrom="opacity-100 transform translate-x-0"
                                leaveTo="opacity-0 transform translate-x-4"
                            >
                                <div>
                                    <PasswordsFilter folders={folders} expirySoonCount={expirySoonCount} expiredCount={expiredCount} />
                                </div>
                            </Transition>
                        </div>

                        {/* Table */}
                        <div className="border-sidebar-border/70 dark:border-sidebar-border mt-8 max-h-[calc(100%-120px)] overflow-auto rounded-xl border">
                            <div className="relative w-full">
                                <table className="w-full caption-bottom text-sm select-none">
                                    {!passwords.data.length && (
                                        <TableCaption className="text-muted-foreground mt-4 text-sm">
                                            No passwords found. Create a new password to get started.
                                        </TableCaption>
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
                        <TablePagination pagination={passwords} className="mt-4" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
