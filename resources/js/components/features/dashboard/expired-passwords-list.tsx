import { PasswordsTable } from '@/components/features/passwords/passwords-table';
import { Button } from '@/components/ui/button';
import { useCreatePassword } from '@/contexts';
import { Password } from '@/types/passwords';
import { Link } from '@inertiajs/react';

interface ExpiredPasswordsListProps {
    passwords: Password[];
}

export function ExpiredPasswordsList({ passwords }: ExpiredPasswordsListProps) {
    const { openSheet: openCreatePasswordSheet } = useCreatePassword();

    // Build URL with expiry filter for "View all" button
    const viewAllUrl = route('passwords.index', { expiry_filter: 'expired' });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recently Expired</h3>
                <Button asChild variant="outline">
                    <Link href={viewAllUrl}>View all</Link>
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
                        <p className="text-muted-foreground text-sm">No recently expired passwords</p>
                        <Button className="mt-4" onClick={openCreatePasswordSheet}>
                            Create
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
