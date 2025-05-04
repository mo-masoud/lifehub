import InputError from '@/components/dashboard/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { __ } from '@/lib/i18n';
import { generatePassword } from '@/lib/utils';
import { SSH } from '@/types/models';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Dices, Eye, EyeOff, FilePenLine } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

type SSHForm = {
    name: string;
    username?: string;
    ip?: string;
    prompt?: string;
    password?: string;
};

export const UpdateSsh = ({ ssh }: { ssh: SSH }) => {
    const [showSheet, setShowSheet] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<SSHForm>>({
        name: ssh.name || '',
        username: ssh.username || '',
        ip: ssh.ip || '',
        prompt: ssh.prompt || '',
        password: ssh.password || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('dashboard.sshs.update', ssh.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(__('messages.updated_successfully'));
                setShowSheet(false);
            },
        });
    };

    return (
        <Sheet open={showSheet} onOpenChange={setShowSheet}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setShowSheet(true)}>
                    <FilePenLine className="size-4 text-green-500" />
                </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <SheetHeader>
                    <SheetTitle>{__('ssh.update_password')}</SheetTitle>
                    <SheetDescription className="sr-only"></SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="space-y-4 p-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="truncate">
                            {__('fields.name')} <span className="mx-1 text-lg text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full placeholder:text-xs"
                            placeholder={__('ssh.name_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="prompt" className="truncate">
                            {__('ssh.prompt')}
                        </Label>
                        <Input
                            id="prompt"
                            value={data.prompt}
                            onChange={(e) => setData('prompt', e.target.value)}
                            className="mt-1 block w-full placeholder:text-xs"
                            placeholder={__('ssh.prompt_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.prompt} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="username" className="truncate">
                            {__('fields.username')}
                        </Label>
                        <Input
                            id="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            className="mt-1 block w-full placeholder:text-xs"
                            placeholder={__('ssh.username_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.username} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="ip" className="truncate">
                            {__('fields.ip')}
                        </Label>
                        <Input
                            id="url"
                            value={data.ip}
                            onChange={(e) => setData('ip', e.target.value)}
                            className="mt-1 block w-full placeholder:text-xs"
                            placeholder={__('ssh.ip_placeholder')}
                            autoComplete="off"
                        />
                        <InputError className="mt-1 text-xs" message={errors.ip} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="truncate">
                            {__('fields.password')} <span className="mx-1 text-lg text-red-500">*</span>
                        </Label>
                        <div className="mt-1 flex w-full items-center gap-1">
                            <Input
                                id="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type={showPassword ? 'text' : 'password'}
                                className="block w-full placeholder:text-xs"
                                placeholder={__('ssh.password_placeholder')}
                                autoComplete="off"
                            />
                            <Button variant="ghost" size="icon" onClick={() => setShowPassword((prev) => !prev)} type="button">
                                {showPassword ? <EyeOff /> : <Eye />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => {
                                    setData('password', generatePassword());
                                }}
                            >
                                <Dices />
                            </Button>
                        </div>
                        <InputError className="mt-1 text-xs" message={errors.password} />
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-4">
                        <Button disabled={processing}>{__('messages.save')}</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">{__('messages.saved')}</p>
                        </Transition>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};
