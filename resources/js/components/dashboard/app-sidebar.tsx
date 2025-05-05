import { NavFooter } from '@/components/dashboard/nav-footer';
import { NavMain } from '@/components/dashboard/nav-main';
import { NavUser } from '@/components/dashboard/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { __ } from '@/lib/i18n';
import { type NavItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Aperture, ArrowLeftRight, Computer, KeyRound, LayoutGrid, Scale } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
        icon: LayoutGrid,
    },
    {
        title: __('general.password_manager'),
        href: route('dashboard.passwords.index'),
        icon: KeyRound,
    },
    {
        title: __('general.ssh_manager'),
        href: route('dashboard.sshs.index'),
        icon: Computer,
    },
];

const savingsNavItems: NavItem[] = [
    {
        title: __('savings.initial_balance'),
        href: route('dashboard.savings.initial.index'),
        icon: Scale,
    },
    {
        title: __('savings.snapshots'),
        href: route('dashboard.savings.snapshots.index'),
        icon: Aperture,
    },
    {
        title: __('savings.transactions'),
        href: route('dashboard.savings.transactions.index'),
        icon: ArrowLeftRight,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const page = usePage<SharedData>();

    return (
        <Sidebar collapsible="icon" variant="inset" side={page.props.dir === 'rtl' ? 'right' : 'left'}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard.home')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} savingsItems={savingsNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
