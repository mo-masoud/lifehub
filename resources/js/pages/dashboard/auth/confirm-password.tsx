// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/dashboard/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/dashboard/auth-layout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('dashboard.password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title={__('auth.confirm_password')} description={__('auth.confirm_password_description')}>
            <Head title={__('auth.confirm_password')} />

            <form onSubmit={submit}>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">{__('fields.passwords')}</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            placeholder={__('fields.passwords')}
                            autoComplete="current-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {__('auth.confirm_password')}
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
