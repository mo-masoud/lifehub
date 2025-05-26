import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton } from '@/components/ui/sidebar';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Folder } from '@/types/models';
import { Link, usePage } from '@inertiajs/react';
import { Folder as FolderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FolderWithCounts extends Folder {
    passwords_count: number;
    sshs_count: number;
}

export function NavFolders() {
    const page = usePage();
    const [folders, setFolders] = useState<FolderWithCounts[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await fetch(route('dashboard.folders.index'));
                if (response.ok) {
                    const data = await response.json();
                    setFolders(data);
                }
            } catch (error) {
                console.error('Failed to fetch folders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFolders();
    }, []);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{__('general.folders')}</SidebarGroupLabel>
            <SidebarMenu>
                {loading ? (
                    <>
                        <SidebarMenuSkeleton showIcon />
                        <SidebarMenuSkeleton showIcon />
                        <SidebarMenuSkeleton showIcon />
                    </>
                ) : folders.length === 0 ? (
                    <SidebarMenuItem>
                        <div className="text-muted-foreground flex h-8 items-center px-2 text-xs">{__('general.no_folders')}</div>
                    </SidebarMenuItem>
                ) : (
                    folders.map((folder) => {
                        const isActive = page.url.startsWith(`/dashboard/folders/${folder.id}`);
                        const totalItems = folder.passwords_count + folder.sshs_count;

                        return (
                            <SidebarMenuItem key={folder.id}>
                                <SidebarMenuButton asChild isActive={isActive} tooltip={{ children: folder.name }}>
                                    <Link href={route('dashboard.folders.show', folder.id)} prefetch>
                                        <FolderIcon className={cn(!isActive && 'text-primary')} />
                                        <span className="flex-1 truncate">{folder.name}</span>
                                        {totalItems > 0 && <span className="text-muted-foreground ml-auto text-xs">{totalItems}</span>}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
