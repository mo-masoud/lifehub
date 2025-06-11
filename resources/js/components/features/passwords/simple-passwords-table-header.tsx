import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function SimplePasswordsTableHeader() {
    return (
        <TableHeader className="bg-muted sticky top-0 z-15">
            <TableRow>
                <TableHead>
                    <span className="text-muted-foreground text-xs font-bold uppercase">Name</span>
                </TableHead>
                <TableHead>
                    <span className="text-muted-foreground text-xs font-bold uppercase">Username</span>
                </TableHead>
                <TableHead>
                    <span className="text-muted-foreground text-xs font-bold uppercase">Folder</span>
                </TableHead>
                <TableHead>
                    <span className="text-muted-foreground text-xs font-bold uppercase">Last used</span>
                </TableHead>
                <TableHead className="text-end">
                    <span className="sr-only">Actions</span>
                </TableHead>
            </TableRow>
        </TableHeader>
    );
}
