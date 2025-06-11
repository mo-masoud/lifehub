import { PasswordsTable } from '@/components/features/passwords/passwords-table';
import { Button } from '@/components/ui/button';
import { useCreatePassword } from '@/contexts';
import { Password } from '@/types/passwords';
import { Link } from '@inertiajs/react';

interface RecentPasswordsListProps {
    passwords: Password[];
}

export function RecentPasswordsList({ passwords }: RecentPasswordsListProps) {
    const { openSheet: openCreatePasswordSheet } = useCreatePassword();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recently Used</h3>
                <Button asChild variant="outline">
                    <Link href={route('passwords.index')}>View all</Link>
                </Button>
            </div>

            <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-md border">
                {passwords.length > 0 ? (
                    <div className="relative overflow-hidden">
                        <div className="max-h-80 overflow-auto rounded-md">
                            <PasswordsTable passwords={passwords} hasFullFunctionality={false} />
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-muted-foreground text-sm">No recently used passwords</p>
                        <Button className="mt-4" onClick={openCreatePasswordSheet}>
                            Create
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
