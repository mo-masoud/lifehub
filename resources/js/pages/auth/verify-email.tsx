// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button type="submit" disabled={processing} className="group w-full">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                    <Mail className="size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </Button>

                <TextLink
                    href={route('logout')}
                    method="post"
                    className="text-gradient mx-auto block text-sm font-semibold transition-transform duration-200 hover:scale-105"
                >
                    Log out
                </TextLink>
            </form>
        </AuthLayout>
    );
}
