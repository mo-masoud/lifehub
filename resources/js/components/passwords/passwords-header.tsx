import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useCreatePassword } from '@/contexts/create-password-context';
import { Link } from '@inertiajs/react';
import { LockKeyhole, RefreshCcw } from 'lucide-react';
import { FC } from 'react';
import { PasswordBulkActions } from './password-bulk-actions';

interface PasswordsHeaderProps {
    selectedPasswordIds: Set<number>;
}

export const PasswordsHeader: FC<PasswordsHeaderProps> = ({ selectedPasswordIds }) => {
    const { openSheet } = useCreatePassword();

    return (
        <div className="flex items-center justify-between">
            <Heading title="Passwords" description="Manage your passwords securely." icon={LockKeyhole} />

            <div className="flex items-center gap-2">
                {/* Bulk Actions */}
                {selectedPasswordIds.size > 0 && <PasswordBulkActions selectedPasswordIds={selectedPasswordIds} />}
                <Button variant="ghost" asChild size="icon" className="hidden md:inline-flex">
                    <Link href={route('passwords.index')} prefetch>
                        <RefreshCcw className="size-4" />
                    </Link>
                </Button>
                <Button onClick={openSheet}>Create</Button>
            </div>
        </div>
    );
};
