import { SelectOrCreate } from '@/components/dashboard/select-or-create';
import { InputError } from '@/components/forms/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { __ } from '@/lib/i18n';
import { Folder, SSH } from '@/types/models';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

type SShForm = {
    name: string;
    username: string;
    ip: string;
    prompt: string;
    password: string;
    folder_id: number | null;
};

export const SSHForm = ({ ssh, onSave, defaultFolder }: { ssh?: SSH; onSave: (form: SShForm) => void; defaultFolder?: Folder }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, patch, errors, processing, recentlySuccessful } = useForm<SShForm>({
        name: ssh?.name || '',
        username: ssh?.username || '',
        prompt: ssh?.prompt || '',
        ip: ssh?.ip || '',
        password: ssh?.password || '',
        folder_id: ssh?.folder_id || defaultFolder?.id || null,
    });

    const fetchFolders = async () => {
        try {
            const response = await axios.get(route('api.dashboard.folders.index'));
            setFolders(response.data);
        } catch (err) {
            console.error('Error fetching folders:', err);
        }
    };

    const handleCreateFolder = async (name: string) => {
        const response = await axios.post(route('api.dashboard.folders.store'), {
            name,
        });
        return response.data;
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const method = ssh ? patch : post;
        const url = ssh ? route('dashboard.sshs.update', ssh.id) : route('dashboard.sshs.store');
        const message = ssh ? __('messages.updated_successfully') : __('messages.created_successfully');

        method(url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(message);
                onSave(data);
            },
        });
    };

    return (
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
                    {__('ssh.ip')}
                </Label>
                <Input
                    id="ip"
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
                </div>
                <InputError className="mt-1 text-xs" message={errors.password} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="folder" className="truncate">
                    {__('fields.folder')}
                </Label>
                <SelectOrCreate
                    options={folders}
                    selectedOption={data.folder_id}
                    label="name"
                    placeholder={__('messages.choose_folder')}
                    onCreate={(folder: Folder) => {
                        setFolders((prev) => [...prev, folder]);
                    }}
                    onChange={(folder: Folder) => setData('folder_id', folder?.id || null)}
                    create={handleCreateFolder}
                />
                <InputError className="mt-1 text-xs" message={errors.folder_id} />
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
    );
};
