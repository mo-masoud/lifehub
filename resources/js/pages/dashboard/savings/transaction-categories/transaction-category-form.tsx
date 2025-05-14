import InputError from '@/components/dashboard/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { TransactionCategory } from '@/types/models';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

type TransactionCategoryFormProps = {
    name: string;
    direction: string;
};

export const TransactionCategoryForm = ({
    category,
    onSave,
}: {
    category?: TransactionCategory;
    onSave: (category: TransactionCategoryFormProps) => void;
}) => {
    const { data, setData, post, patch, errors, processing, recentlySuccessful } = useForm<Required<TransactionCategoryFormProps>>({
        name: category?.name || '',
        direction: category?.direction || 'in',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const method = category ? patch : post;
        const url = category
            ? route('dashboard.savings.transaction-categories.update', category.id)
            : route('dashboard.savings.transaction-categories.store');
        const message = category ? __('messages.updated_successfully') : __('messages.created_successfully');

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
                    type="text"
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full placeholder:text-xs"
                    placeholder={__('fields.name_placeholder')}
                    autoComplete="off"
                />
                <InputError className="mt-1 text-xs" message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="direction" className="truncate">
                    {__('savings.direction')} <span className="mx-1 text-lg text-red-500">*</span>
                </Label>
                <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                    <button
                        type="button"
                        onClick={() => setData('direction', 'in')}
                        className={cn(
                            'flex w-full cursor-pointer items-center justify-center rounded-md px-3.5 py-1.5 text-green-500 transition-colors',
                            data.direction === 'in'
                                ? 'bg-white shadow-xs dark:bg-neutral-700'
                                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        <ArrowDown className="h-4 w-4 ltr:-ml-1 rtl:-mr-1" />
                        <span className="text-sm ltr:ml-1.5 rtl:mr-1.5">{__('savings.in')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setData('direction', 'out')}
                        className={cn(
                            'flex w-full cursor-pointer items-center justify-center rounded-md px-3.5 py-1.5 text-red-500 transition-colors',
                            data.direction === 'out'
                                ? 'bg-white shadow-xs dark:bg-neutral-700'
                                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        <ArrowUp className="h-4 w-4 ltr:-ml-1 rtl:-mr-1" />
                        <span className="text-sm ltr:ml-1.5 rtl:mr-1.5">{__('savings.out')}</span>
                    </button>
                </div>
                <InputError className="mt-1 text-xs" message={errors.direction} />
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
