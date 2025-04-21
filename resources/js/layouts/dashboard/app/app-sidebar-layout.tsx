import { AppContent } from '@/components/dashboard/app-content';
import { AppShell } from '@/components/dashboard/app-shell';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { AppSidebarHeader } from '@/components/dashboard/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{
    breadcrumbs?: BreadcrumbItem[];
}>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
