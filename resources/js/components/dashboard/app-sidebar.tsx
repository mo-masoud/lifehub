import { NavFooter } from '@/components/dashboard/nav-footer';
import { NavMain } from '@/components/dashboard/nav-main';
import { NavUser } from '@/components/dashboard/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { __ } from '@/lib/i18n';
import { type NavItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Aperture, Archive, ArrowLeftRight, Computer, KeyRound, LayoutGrid, Tag, Target } from 'lucide-react';
import AppLogo from './app-logo';

const navItems: NavItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
        icon: LayoutGrid,
    },
    {
        title: __('general.passwords'),
        href: route('dashboard.passwords.index'),
        icon: KeyRound,
        category: __('general.password_manager'),
    },
    {
        title: __('general.ssh_manager'),
        href: route('dashboard.sshs.index'),
        icon: Computer,
        category: __('general.password_manager'),
    },
    {
        title: __('savings.storage_locations'),
        href: route('dashboard.savings.storage-locations.index'),
        icon: Archive,
        category: __('general.savings'),
    },
    {
        title: __('savings.transaction_categories'),
        href: route('dashboard.savings.transaction-categories.index'),
        icon: Tag,
        category: __('general.savings'),
    },
    {
        title: __('savings.transactions'),
        href: route('dashboard.savings.transactions.index'),
        icon: ArrowLeftRight,
        category: __('general.savings'),
    },
    {
        title: __('savings.snapshots'),
        href: route('dashboard.savings.snapshots.index'),
        icon: Aperture,
        category: __('general.savings'),
    },
    {
        title: __('savings.goals'),
        href: route('dashboard.savings.goals.index'),
        icon: Target,
        category: __('general.savings'),
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
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
