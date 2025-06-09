import { SharedData } from '@/types';
import { NavGroup } from '@/types/navigation';
import { FileText, FolderOpen, LayoutDashboard, List, LockKeyhole, ShieldPlus } from 'lucide-react';

export const getDefaultNavigation = (props: SharedData, openSheet: () => void): NavGroup[] => [
    {
        label: 'Platform',
        items: [
            {
                label: 'Dashboard',
                icon: LayoutDashboard,
                href: '/dashboard',
                isActive: () => route().current('dashboard'),
                tooltip: 'Dashboard',
            },
            {
                label: 'Folders',
                icon: FolderOpen,
                href: route('folders.index'),
                isActive: () => route().current('folders.index'),
                tooltip: 'Folders',
            },
        ],
    },
    {
        label: 'Passwords Management',
        items: [
            {
                label: 'Passwords',
                icon: LockKeyhole,
                isActive: () => route().current('passwords.*'),
                tooltip: 'Passwords',
                href: route('passwords.index'),
                collapsible: true,
                defaultOpen: true,
                subItems: [
                    {
                        label: 'All Passwords',
                        icon: List,
                        href: route('passwords.index'),
                        isActive: () => route().current('passwords.index'),
                        badge: props.passwordsCount > 99 ? '99+' : props.passwordsCount,
                    },
                    {
                        label: 'New Password',
                        icon: ShieldPlus,
                        onClick: openSheet,
                    },
                    {
                        label: 'Audit Log',
                        icon: FileText,
                        href: route('passwords.audit-logs.index'),
                        isActive: () => route().current('passwords.audit-logs.index'),
                    },
                ],
            },
        ],
    },
];
