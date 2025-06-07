import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, FileText, LayoutDashboard, List, LockKeyhole, ShieldPlus } from 'lucide-react';

export const NavMain = () => {
    const page = usePage();
    const { open } = useSidebar();

    return (
        <>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={page.url === '/dashboard'} tooltip={{ children: 'Dashboard' }}>
                            <Link href="/dashboard" prefetch>
                                <LayoutDashboard />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="px-2 py-0">
                <SidebarMenu>
                    <Collapsible defaultOpen className="group/collapsible">
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={{ children: 'Passwords' }} isActive={page.url.startsWith('/passwords')} asChild={!open}>
                                    {open ? (
                                        <>
                                            <LockKeyhole />
                                            <span>Passwords</span>
                                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                        </>
                                    ) : (
                                        <Link href="/passwords" prefetch>
                                            <LockKeyhole />
                                            <span>Passwords</span>
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub className="mr-0 pr-0">
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild isActive={page.url === '/passwords'}>
                                            <Link href="/passwords" prefetch>
                                                <span className="text-sky-700 dark:text-sky-300">
                                                    <List className="size-4" />
                                                </span>
                                                <span>All Passwords</span>
                                                <SidebarMenuBadge className="bg-sky-100">24</SidebarMenuBadge>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton className="cursor-pointer">
                                            <span className="text-emerald-700 dark:text-emerald-300">
                                                <ShieldPlus className="size-4" />
                                            </span>
                                            <span>New Password</span>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild isActive={page.url === '/audit-logs'}>
                                            <Link href={route('passwords.audit-logs.index')} prefetch>
                                                <span className="text-purple-700 dark:text-purple-300">
                                                    <FileText className="size-4" />
                                                </span>
                                                <span>Audit Log</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
};
