import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage<SharedData>();

    const groupedItems = items.reduce(
        (groups, item) => {
            const category = item.category || __('general.platform');
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        },
        {} as Record<string, NavItem[]>,
    );

    return (
        <>
            {Object.entries(groupedItems).map(([category, items]) => {
                if (category === __('general.savings') && !page.props.initial_savings_completed) {
                    return null;
                }
                return (
                    <SidebarGroup key={category} className="px-2 py-0">
                        <SidebarGroupLabel>{category}</SidebarGroupLabel>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = new URL(item.href).pathname === page.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive} tooltip={{ children: item.title }}>
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon className={cn(!isActive && 'text-primary')} />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                );
            })}
        </>
    );
}
