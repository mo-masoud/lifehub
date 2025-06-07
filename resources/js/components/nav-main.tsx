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
import { useCreatePassword } from '@/contexts/create-password-context';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, FileText, LayoutDashboard, List, LockKeyhole, ShieldPlus } from 'lucide-react';

export const NavMain = () => {
    const page = usePage<SharedData>();
    const { open } = useSidebar();
    const { openSheet } = useCreatePassword();

    const handleNewPassword = () => {
        openSheet();
    };

    const passwordsCount = page.props.passwordsCount > 99 ? '99+' : page.props.passwordsCount;

    return (
        <>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={route().current('dashboard')} tooltip={{ children: 'Dashboard' }}>
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
                                <SidebarMenuButton tooltip={{ children: 'Passwords' }} isActive={route().current('passwords.*')} asChild={!open}>
                                    {open ? (
                                        <>
                                            <LockKeyhole />
                                            <span>Passwords</span>
                                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                        </>
                                    ) : (
                                        <Link href={route('passwords.index')} prefetch>
                                            <LockKeyhole />
                                            <span>Passwords</span>
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub className="mr-0 pr-0">
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton isActive={route().current('passwords.index')} asChild>
                                            <Link href={route('passwords.index')} prefetch>
                                                <List className="size-4" />
                                                <span>All Passwords</span>
                                                <SidebarMenuBadge>{passwordsCount}</SidebarMenuBadge>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton className="cursor-pointer" onClick={handleNewPassword}>
                                            <ShieldPlus className="size-4" />
                                            <span>New Password</span>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild isActive={route().current('passwords.audit-logs.index')}>
                                            <Link href={route('passwords.audit-logs.index')} prefetch>
                                                <FileText className="size-4" />
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
