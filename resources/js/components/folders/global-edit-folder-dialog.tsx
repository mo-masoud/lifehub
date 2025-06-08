import { useEditFolder } from '@/contexts/edit-folder-context';
import { EditFolderDialog } from './edit-folder-dialog';

export function GlobalEditFolderDialog() {
    const { isOpen, folder, closeDialog } = useEditFolder();

    if (!folder) return null;

    return <EditFolderDialog folder={folder} open={isOpen} setOpen={closeDialog} />;
}
