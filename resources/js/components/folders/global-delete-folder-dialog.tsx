import { useDeleteFolder } from '@/contexts/delete-folder-context';
import { BulkDeleteFoldersDialog } from './bulk-delete-folders-dialog';
import { DeleteFolderDialog } from './delete-folder-dialog';

export function GlobalDeleteFolderDialog() {
    const { isOpen, folder, selectedFolderIds, closeDialog } = useDeleteFolder();

    if (folder) {
        return <DeleteFolderDialog folder={folder} open={isOpen} setOpen={closeDialog} />;
    }

    if (selectedFolderIds && selectedFolderIds.size > 0) {
        return <BulkDeleteFoldersDialog selectedFolderIds={selectedFolderIds} open={isOpen} setOpen={closeDialog} />;
    }

    return null;
}
