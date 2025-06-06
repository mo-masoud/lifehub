import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { Password } from '@/types/models';
import { FC, useState } from 'react';
import { PasswordForm } from './password-form';

interface EditPasswordSheetProps {
    password: Password;
    children: React.ReactNode;
}

export const EditPasswordSheet: FC<EditPasswordSheetProps> = ({ password, children }) => {
    const [open, setOpen] = useState(false);
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full overflow-y-auto pb-8 sm:max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()} aria-hidden={false}>
                <SheetHeader>
                    <SheetTitle>Edit Password</SheetTitle>
                    <SheetDescription>Edit the password details</SheetDescription>
                </SheetHeader>

                <div className="p-4">
                    <PasswordForm password={password} onSubmit={() => setOpen(false)} />
                </div>
            </SheetContent>
        </Sheet>
    );
};
