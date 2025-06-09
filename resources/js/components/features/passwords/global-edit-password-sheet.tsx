import { useEditPassword } from '@/contexts/passwords/edit-password-context';
import { EditPasswordSheet } from './edit-password-sheet';

export function GlobalEditPasswordSheet() {
    const { isOpen, password, closeSheet } = useEditPassword();

    const handleSetOpen = (open: boolean) => {
        if (!open) {
            closeSheet();
        }
    };

    if (!password) return null;

    return <EditPasswordSheet password={password} open={isOpen} setOpen={handleSetOpen} />;
}
