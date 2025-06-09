import { useCreatePassword } from '@/contexts/passwords/create-password-context';
import { CreatePasswordSheet } from './create-password-sheet';

export function GlobalCreatePasswordSheet() {
    const { isOpen, closeSheet } = useCreatePassword();

    const handleSetOpen = (open: boolean) => {
        if (!open) {
            closeSheet();
        }
    };

    return <CreatePasswordSheet open={isOpen} setOpen={handleSetOpen} />;
}
