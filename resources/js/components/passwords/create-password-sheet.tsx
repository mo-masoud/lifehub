import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FC, useState } from 'react';
import { PasswordForm } from './password-form';

interface CreatePasswordSheetProps {
    children: React.ReactNode;
}

export const CreatePasswordSheet: FC<CreatePasswordSheetProps> = ({ children }) => {
    const [open, setOpen] = useState(false);
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Create Password</SheetTitle>
                    <SheetDescription>Create a new password to store in your vault.</SheetDescription>
                </SheetHeader>
                <div className="p-4">
                    <PasswordForm onSubmit={() => setOpen(false)} />
                </div>
            </SheetContent>
        </Sheet>
    );
};
