import { InputError } from '@/components/forms/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Folder } from '@/types/models';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

type FolderForm = {
    name: string;
};

export const FolderForm = ({ folder, onSave }: { folder?: Folder; onSave: (form: FolderForm) => void }) => {
    const { data, setData, post, patch, errors, processing, recentlySuccessful } = useForm<FolderForm>({
        name: folder?.name || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const method = folder ? patch : post;
        const url = folder ? route('dashboard.folders.update', folder.id) : route('dashboard.folders.store');
        const message = folder ? __('messages.updated_successfully') : __('messages.created_successfully');

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
        <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="name" className="truncate">
                    {__('fields.name')}
                </Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full placeholder:text-xs"
                    placeholder={__('fields.name_placeholder')}
                    autoComplete="off"
                />

                <InputError className="mt-1 text-xs" message={errors.name} />
            </div>
            <div className="flex justify-end space-x-2">
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
