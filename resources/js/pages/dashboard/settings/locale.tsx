import HeadingSmall from '@/components/dashboard/heading-small';
import InputError from '@/components/dashboard/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/dashboard/app-layout';
import SettingsLayout from '@/layouts/dashboard/settings/layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('settings.locale_settings'),
        href: route('dashboard.settings.locale'),
    },
];

interface LocaleProps {
    languages: {
        key: string;
        name: string;
        dir: 'ltr' | 'rtl';
    }[];
}

export default function Locale({ languages }: LocaleProps) {
    const { locale } = usePage<SharedData>().props;

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const onLocaleChange = (value: string) => {
        router.put(
            route('locale'),
            {
                locale: value,
            },
            {
                onSuccess: () => {
                    window.location.reload();
                },
                onError: (errors) => {
                    setErrors(errors);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('settings.locale_settings')} />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={__('settings.locale_settings')} description={__('settings.locale_settings_description')} />
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="preferred-locale">{__('fields.preferred_locale')}</Label>

                            <Select value={locale} onValueChange={onLocaleChange}>
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue placeholder={__('fields.preferred_locale')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map((language) => (
                                        <SelectItem key={language.key} value={language.key}>
                                            {language.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <InputError message={errors.locale} />
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
