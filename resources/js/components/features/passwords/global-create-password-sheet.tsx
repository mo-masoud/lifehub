import { useCreatePassword } from '@/contexts/passwords/create-password-context';
import { CreatePasswordSheet } from './create-password-sheet';

export const GlobalCreatePasswordSheet = () => {
    const { isOpen, closeSheet } = useCreatePassword();

    const handleSetOpen = (open: boolean) => {
        if (!open) {
            closeSheet();
        }
    };

    return <CreatePasswordSheet open={isOpen} setOpen={handleSetOpen} />;
};
