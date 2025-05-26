import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder } from '@/types/models';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export const FolderForm = ({ folder, onSave }: { folder?: Folder; onSave?: () => void }) => {
    const [name, setName] = useState(folder?.name || '');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const routeName = folder ? 'dashboard.folders.update' : 'dashboard.folders.store';
        const routeParams = folder ? [folder.id] : [];

        router.post(
            route(routeName, ...routeParams),
            {
                name,
                _method: folder ? 'PUT' : 'POST',
            },
            {
                onSuccess: () => {
                    toast.success(folder ? __('messages.updated_successfully') : __('messages.created_successfully'));
                },
                onError: () => {
                    toast.error(__('messages.something_went_wrong'));
                },
                onFinish: () => {
                    setProcessing(false);
                    onSave?.();
                },
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium">
                    {__('fields.name')}
                </label>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={__('fields.name_placeholder')}
                />
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="submit" disabled={processing}>
                    {processing ? __('messages.saving') : __('messages.save')}
                </Button>
            </div>
        </form>
    );
};
