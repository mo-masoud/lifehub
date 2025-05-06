import InputError from '@/components/dashboard/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { __ } from '@/lib/i18n';
import { StorageLocation } from '@/types/models';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

type StorageLocationForm = {
    name: string;
};

export const StorageLocationForm = ({ storage, onSave }: { storage?: StorageLocation; onSave: (storage: StorageLocationForm) => void }) => {
    const { data, setData, post, patch, errors, processing, recentlySuccessful } = useForm<Required<StorageLocationForm>>({
        name: storage?.name || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!storage) {
            post(route('dashboard.savings.storage-locations.store'), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success(__('messages.created_successfully'));
                    onSave(data);
                },
            });

            return;
        }

        patch(route('dashboard.savings.storage-locations.update', storage.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(__('messages.updated_successfully'));
                onSave(data);
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 p-4">
            <div className="grid gap-2">
                <Label htmlFor="storage" className="truncate">
                    {__('savings.storage')} <span className="mx-1 text-lg text-red-500">*</span>
                </Label>
                <Input
                    id="storage"
                    value={data.name}
                    type="text"
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full placeholder:text-xs"
                    placeholder={__('savings.storage_name_placeholder')}
                    autoComplete="off"
                />
                <InputError className="mt-1 text-xs" message={errors.name} />
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
