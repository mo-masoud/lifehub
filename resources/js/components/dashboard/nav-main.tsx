import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, HandCoins } from 'lucide-react';

export function NavMain({ items = [], savingsItems = [] }: { items: NavItem[]; savingsItems: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{__('general.platform')}</SidebarGroupLabel>
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

                <Collapsible defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={{ children: __('general.savings') }}>
                                <HandCoins className="text-primary" />
                                <span>{__('general.savings')}</span>

                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub className="ltr:mr-0 ltr:pr-0 rtl:ml-0 rtl:pl-0">
                                {savingsItems.map((item, i) => {
                                    const isActive = new URL(item.href).pathname === page.url;
                                    return (
                                        <SidebarMenuSubItem key={i}>
                                            <SidebarMenuButton asChild isActive={isActive} tooltip={{ children: item.title }}>
                                                <Link href={item.href} prefetch>
                                                    {item.icon && <item.icon className={cn(!isActive && 'text-primary')} />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuSubItem>
                                    );
                                })}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}
