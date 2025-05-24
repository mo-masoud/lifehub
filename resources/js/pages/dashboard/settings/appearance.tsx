import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/dashboard/appearance-tabs';
import { HeadingSmall } from '@/components/dashboard/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/dashboard/app-layout';
import SettingsLayout from '@/layouts/dashboard/settings/layout';

import { __ } from '@/lib/i18n';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('settings.appearance_settings'),
        href: route('dashboard.appearance'),
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('settings.appearance_settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={__('settings.appearance_settings')} description={__('settings.appearance_settings_description')} />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
