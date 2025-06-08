import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { FolderOpen, RefreshCcw } from 'lucide-react';
import { FC, useState } from 'react';
import { CreateFolderDialog } from './create-folder-dialog';
import { FolderBulkActions } from './folder-bulk-actions';

interface FoldersHeaderProps {
    selectedFolderIds: Set<number>;
}

export const FoldersHeader: FC<FoldersHeaderProps> = ({ selectedFolderIds }) => {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading title="Folders" description="Organize your passwords with folders." icon={FolderOpen} />

                <div className="flex items-center gap-2">
                    {/* Bulk Actions */}
                    {selectedFolderIds.size > 0 && <FolderBulkActions selectedFolderIds={selectedFolderIds} />}
                    <Button variant="ghost" asChild size="icon" className="hidden md:inline-flex">
                        <Link href={route('folders.index')} prefetch>
                            <RefreshCcw className="size-4" />
                        </Link>
                    </Button>
                    <Button onClick={() => setCreateDialogOpen(true)}>Create Folder</Button>
                </div>
            </div>

            <CreateFolderDialog open={createDialogOpen} setOpen={setCreateDialogOpen} />
        </>
    );
};
