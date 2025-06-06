import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { Password } from '@/types/models';
import { FC } from 'react';
import { PasswordForm } from './password-form';

interface EditPasswordSheetProps {
    password: Password;
    children: React.ReactNode;
}

export const EditPasswordSheet: FC<EditPasswordSheetProps> = ({ password, children }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit Password</SheetTitle>
                    <SheetDescription>Edit the password details</SheetDescription>
                </SheetHeader>

                <div className="p-4">
                    <PasswordForm password={password} />
                </div>
            </SheetContent>
        </Sheet>
    );
};
