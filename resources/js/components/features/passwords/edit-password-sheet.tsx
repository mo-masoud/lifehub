import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { Password } from '@/types/passwords';
import { PasswordForm } from './password-form';

interface EditPasswordSheetProps {
    password: Password;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function EditPasswordSheet({ password, open, setOpen }: EditPasswordSheetProps) {
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="w-full overflow-y-auto pb-8 sm:max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()}>
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
}
