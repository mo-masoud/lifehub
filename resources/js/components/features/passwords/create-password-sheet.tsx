import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PasswordForm } from './password-form';

interface CreatePasswordSheetProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function CreatePasswordSheet({ open, setOpen }: CreatePasswordSheetProps) {
    return (
        <Sheet open={open} onOpenChange={setOpen}>
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
}
