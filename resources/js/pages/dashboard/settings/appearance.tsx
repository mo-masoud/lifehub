import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/dashboard/appearance-tabs';
import { ColorThemePicker } from '@/components/dashboard/color-theme-picker';
import { HeadingSmall } from '@/components/dashboard/heading-small';
import { Separator } from '@/components/ui/separator';
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

                    {/* Light/Dark Mode Toggle */}
                    <div className="space-y-3">
                        <h3 className="text-foreground text-sm font-medium">{__('settings.mode')}</h3>
                        <AppearanceTabs />
                    </div>

                    <Separator />

                    {/* Color Theme Picker */}
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-foreground text-sm font-medium">{__('settings.color_theme')}</h3>
                            <p className="text-muted-foreground text-sm">{__('settings.color_theme_description')}</p>
                        </div>
                        <ColorThemePicker />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
