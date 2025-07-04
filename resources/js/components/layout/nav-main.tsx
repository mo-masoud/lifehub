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
import { useCreatePassword } from '@/contexts/passwords/create-password-context';
import { getDefaultNavigation } from '@/lib/shared/navigation-config';
import { SharedData } from '@/types';
import { NavGroup, NavItem, NavMainProps, NavSubItem } from '@/types/navigation';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export function NavMain({ groups }: NavMainProps = {}) {
    const page = usePage<SharedData>();
    const { open } = useSidebar();
    const { openSheet } = useCreatePassword();

    const navigationGroups = groups || getDefaultNavigation(page.props, openSheet);

    const renderSubItem = (subItem: NavSubItem, index: number) => {
        const isActive = subItem.isActive?.() || false;

        return (
            <SidebarMenuSubItem key={index}>
                <SidebarMenuSubButton
                    isActive={isActive}
                    asChild={!!subItem.href}
                    className={subItem.onClick ? 'cursor-pointer' : undefined}
                    onClick={subItem.onClick}
                >
                    {subItem.href ? (
                        <Link href={subItem.href} prefetch>
                            {subItem.icon && <subItem.icon className="size-4" />}
                            <span>{subItem.label}</span>
                            {subItem.badge != null && <SidebarMenuBadge>{subItem.badge}</SidebarMenuBadge>}
                        </Link>
                    ) : (
                        <>
                            {subItem.icon && <subItem.icon className="size-4" />}
                            <span>{subItem.label}</span>
                            {subItem.badge != null && <SidebarMenuBadge>{subItem.badge}</SidebarMenuBadge>}
                        </>
                    )}
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        );
    };

    const renderItem = (item: NavItem, index: number) => {
        const isActive = item.isActive?.() || false;
        const tooltip = { children: item.tooltip || item.label };

        if (item.collapsible && item.subItems) {
            return (
                <Collapsible key={index} defaultOpen={item.defaultOpen} className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={tooltip} isActive={!open && isActive} asChild={!open} onClick={item.onClick}>
                                {open ? (
                                    <>
                                        {item.icon && <item.icon />}
                                        <span className="font-semibold">{item.label}</span>
                                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                    </>
                                ) : item.href ? (
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span className="font-semibold">{item.label}</span>
                                    </Link>
                                ) : (
                                    <div>
                                        {item.icon && <item.icon />}
                                        <span className="font-semibold">{item.label}</span>
                                    </div>
                                )}
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub className="mr-0 pr-0">{item.subItems.map(renderSubItem)}</SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            );
        }

        return (
            <SidebarMenuItem key={index}>
                <SidebarMenuButton
                    asChild={!!item.href}
                    isActive={isActive}
                    tooltip={tooltip}
                    onClick={item.onClick}
                    className={item.onClick ? 'cursor-pointer' : undefined}
                >
                    {item.href ? (
                        <Link href={item.href} prefetch>
                            {item.icon && <item.icon />}
                            <span className="font-semibold">{item.label}</span>
                            {item.badge != null && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                        </Link>
                    ) : (
                        <>
                            {item.icon && <item.icon />}
                            <span className="font-semibold">{item.label}</span>
                            {item.badge != null && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                        </>
                    )}
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    };

    const renderGroup = (group: NavGroup, index: number) => (
        <SidebarGroup key={index} className="px-2 py-0">
            {group.label && open && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>{group.items.map(renderItem)}</SidebarMenu>
        </SidebarGroup>
    );

    return <>{navigationGroups.map(renderGroup)}</>;
}
