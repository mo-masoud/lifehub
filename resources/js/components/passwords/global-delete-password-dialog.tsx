import { useDeletePassword } from '@/contexts/delete-password-context';
import { DeletePasswordDialog } from './delete-password-dialog';

export const GlobalDeletePasswordDialog = () => {
    const { isOpen, password, selectedPasswordIds, closeDialog } = useDeletePassword();

    const handleSetOpen = (open: boolean) => {
        if (!open) {
            closeDialog();
        }
    };

    return (
        <DeletePasswordDialog
            open={isOpen}
            setOpen={handleSetOpen}
            password={password || undefined}
            selectedPasswordIds={selectedPasswordIds || undefined}
        />
    );
};
