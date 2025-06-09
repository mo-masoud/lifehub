import { cn } from '@/lib/utils';
import { Transition } from '@headlessui/react';
import { type HTMLAttributes } from 'react';

export default function InputError({ message, className = '', ...props }: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return (
        <Transition
            show={!!message}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <p {...props} className={cn('text-sm text-red-600 dark:text-red-400', className)}>
                {message}
            </p>
        </Transition>
    );
}
