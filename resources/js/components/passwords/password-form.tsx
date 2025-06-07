import { SmartRadioGroup } from '@/components/forms/smart-radio-group';
import InputError from '@/components/input-error';
import { MarkdownReader } from '@/components/markdown-reader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateRandomPassword } from '@/lib/passwords';
import { Password } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { Dices, EyeIcon, EyeOffIcon, Info, KeyRound, Loader, ScanEye, Terminal } from 'lucide-react';
import { FC, FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import { FoldersCombobox } from '../folders/folders-combobox';
import { QuickTooltip } from '../quick-tooltip';

interface PasswordFormProps {
    password?: Password;
    onSubmit?: () => void;
}

export const PasswordForm: FC<PasswordFormProps> = ({ password, onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [previewNotes, setPreviewNotes] = useState(false);

    const { data, setData, errors, processing, post, patch, reset } = useForm({
        name: password?.name ?? '',
        username: password?.username ?? '',
        type: password?.type ?? 'normal',
        password: password?.password ?? '',
        url: password?.url ?? '',
        cli: password?.cli ?? '',
        folder_id: password?.folder_id ?? null,
        notes: password?.notes ?? '',
        expires_at: password?.expires_at ? new Date(password.expires_at) : null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const method = password ? patch : post;
        const url = password ? route('passwords.update', password.id) : route('passwords.store');

        method(url, {
            onSuccess: () => {
                reset();
                onSubmit?.();
                toast.success('Password saved successfully.');
            },
        });
    };

    return (
        <form className="space-y-6" onSubmit={submit}>
            {/* Name */}
            <div className="grid gap-2">
                <Label htmlFor="name">
                    Name
                    <span className="text-destructive ml-px text-xs">*</span>
                </Label>
                <Input
                    id="name"
                    type="text"
                    className="mt-1 block w-full"
                    autoComplete="off"
                    placeholder="Enter a name, e.g. 'GitHub' or 'Google'"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                <InputError message={errors.name} />
            </div>

            {/* Type */}
            <div className="grid gap-2">
                <Label htmlFor="type">
                    Type
                    <span className="text-destructive ml-px text-xs">*</span>
                </Label>
                <SmartRadioGroup
                    options={[
                        { label: 'Normal', value: 'normal', icon: <KeyRound className="-ml-1 size-4" /> },
                        { label: 'SSH', value: 'ssh', icon: <Terminal className="-ml-1 size-4" /> },
                    ]}
                    value={data.type}
                    onChange={(value) => setData('type', value as 'normal' | 'ssh')}
                />
                <InputError message={errors.type} />
            </div>

            {/* Username */}
            <div className="grid gap-2">
                <Label htmlFor="saved_username" className="flex items-center">
                    Username
                    {data.type === 'normal' ? (
                        <span className="text-destructive ml-px text-xs">*</span>
                    ) : (
                        <QuickTooltip content="This is an optional field for SSH passwords you can enter a username here or just use the CLI input instead.">
                            <Info className="text-warning ml-1 size-3" />
                        </QuickTooltip>
                    )}
                </Label>
                <Input
                    id="saved_username"
                    type="text"
                    className="mt-1 block w-full"
                    autoComplete="off"
                    placeholder="Enter a username."
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                />
                <InputError message={errors.username} />
            </div>

            {/* IP */}
            {data.type === 'ssh' && (
                <div className="grid gap-2">
                    <Label htmlFor="ip" className="flex items-center gap-1">
                        IP/Hostname
                        <QuickTooltip content="This is an optional field for SSH passwords you can enter a IP or hostname here or just use the CLI input instead.">
                            <Info className="text-warning ml-1 size-3" />
                        </QuickTooltip>
                    </Label>
                    <Input
                        id="ip"
                        type="text"
                        className="mt-1 block w-full"
                        autoComplete="off"
                        placeholder="Enter a IP or hostname."
                        value={data.url}
                        onChange={(e) => setData('url', e.target.value)}
                    />
                    <InputError message={errors.url} />
                </div>
            )}

            {/* CLI */}
            {data.type === 'ssh' && (
                <div className="grid gap-2">
                    <Label htmlFor="cli" className="flex items-center gap-1">
                        CLI
                        <QuickTooltip content="You can enter a CLI command here and the username will be automatically extracted from the command.">
                            <Info className="text-warning ml-1 size-3" />
                        </QuickTooltip>
                    </Label>
                    <Input
                        id="cli"
                        type="text"
                        className="mt-1 block w-full"
                        autoComplete="off"
                        placeholder="Enter a CLI command e.g. 'ssh user@host'."
                        value={data.cli}
                        onChange={(e) => setData('cli', e.target.value)}
                    />
                    <InputError message={errors.cli} />
                </div>
            )}

            {/* SSH Info */}
            {data.type === 'ssh' && (
                <div className="flex items-start gap-2">
                    <Info className="text-warning size-8" />
                    <span className="text-muted-foreground mt-1 text-xs">
                        Username and IP/Hostname can be extracted from the CLI command, but you can also enter them manually, if you don't use the CLI
                        command the Username and IP/Hostname will be required.
                    </span>
                </div>
            )}

            {/* Password */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="saved_password">
                    Password
                    <span className="text-destructive ml-px text-xs">*</span>
                </Label>
                <div className="flex items-center gap-1">
                    <Input
                        id="saved_password"
                        type={showPassword ? 'text' : 'password'}
                        className="mt-1 block w-full"
                        autoComplete="off"
                        placeholder="Enter a strong password."
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <Button variant="ghost" type="button" className="mt-1" size="icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </Button>

                    <QuickTooltip content="Generate a random password" asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            className="mt-1"
                            size="icon"
                            onClick={() => setData('password', generateRandomPassword())}
                        >
                            <Dices />
                        </Button>
                    </QuickTooltip>
                </div>
                <InputError message={errors.password} />
            </div>

            {/* Folder */}
            <div className="grid gap-2">
                <Label htmlFor="folder_id">Folder</Label>
                <FoldersCombobox
                    hideAllFolderOption
                    canCreateFolder
                    selectedFolder={data.folder_id?.toString()}
                    onSelectFolder={(folder) => setData('folder_id', parseInt(folder))}
                />
                <InputError message={errors.folder_id} />
            </div>

            {/* Expires at */}
            <div className="grid gap-2">
                <Label htmlFor="expires_at">Expires at</Label>
                <Input
                    id="expires_at"
                    type="date"
                    className="mt-1 block w-full"
                    min={new Date().toISOString().split('T')[0]}
                    value={data.expires_at ? data.expires_at.toISOString().split('T')[0] : ''}
                    onChange={(e) => setData('expires_at', new Date(e.target.value))}
                />
            </div>

            {/* URL */}
            {data.type === 'normal' && (
                <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                        id="url"
                        type="text"
                        className="mt-1 block w-full"
                        autoComplete="off"
                        placeholder="Enter a URL."
                        value={data.url}
                        onChange={(e) => setData('url', e.target.value)}
                    />
                    <InputError message={errors.url} />
                </div>
            )}

            {/* Notes */}
            <div className="-mt-4 grid gap-2">
                <div className="flex h-12 items-center justify-between">
                    <Label htmlFor="notes">Notes</Label>
                    {data.notes && (
                        <QuickTooltip content="Preview notes as a markdown" asChild>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setPreviewNotes(!previewNotes)}>
                                <ScanEye />
                            </Button>
                        </QuickTooltip>
                    )}
                </div>

                {previewNotes && data.notes ? (
                    <div className="border-border -mt-2 min-h-24 w-full rounded-md border px-3 py-2 shadow-xs">
                        <MarkdownReader>{data.notes}</MarkdownReader>
                    </div>
                ) : (
                    <Textarea
                        id="notes"
                        className="-mt-2 block min-h-24 w-full"
                        placeholder="Enter a note."
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                )}
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing} className="min-w-16">
                    {processing ? <Loader className="animate-spin duration-1500" /> : 'Save'}
                </Button>
            </div>
        </form>
    );
};
