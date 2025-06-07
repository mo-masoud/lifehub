import { NavGroup } from '@/types/navigation';
import { FileText, LayoutDashboard, List, LockKeyhole, ShieldPlus } from 'lucide-react';

export const getDefaultNavigation = (passwordsCount: number, openSheet: () => void): NavGroup[] => [
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
        ],
    },
    {
        items: [
            {
                label: 'Passwords',
                icon: LockKeyhole,
                isActive: () => route().current('passwords.*'),
                tooltip: 'Passwords',
                collapsible: true,
                defaultOpen: true,
                subItems: [
                    {
                        label: 'All Passwords',
                        icon: List,
                        href: route('passwords.index'),
                        isActive: () => route().current('passwords.index'),
                        badge: passwordsCount > 99 ? '99+' : passwordsCount,
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
