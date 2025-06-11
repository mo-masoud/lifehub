import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { useCreatePassword } from '@/contexts/passwords/create-password-context';
import { Link } from '@inertiajs/react';
import { BarChart3, LockKeyhole, RefreshCcw } from 'lucide-react';
import { PasswordBulkActions } from './password-bulk-actions';

interface PasswordsHeaderProps {
    selectedPasswordIds: Set<number>;
    showStats: boolean;
    onToggleStats: () => void;
}

export function PasswordsHeader({ selectedPasswordIds, showStats, onToggleStats }: PasswordsHeaderProps) {
    const { openSheet } = useCreatePassword();

    return (
        <div className="flex items-center justify-between">
            <Heading title="Passwords" description="Manage your passwords securely." icon={LockKeyhole} />

            <div className="flex items-center gap-1">
                {/* Bulk Actions */}
                {selectedPasswordIds.size > 0 && <PasswordBulkActions selectedPasswordIds={selectedPasswordIds} />}

                <Button
                    variant={showStats ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={onToggleStats}
                    title={showStats ? 'Hide Statistics' : 'Show Statistics'}
                >
                    <BarChart3 className="size-4" />
                </Button>

                <Button variant="ghost" asChild size="icon" className="hidden md:inline-flex">
                    <Link href={route('passwords.index')} prefetch>
                        <RefreshCcw className="size-4" />
                    </Link>
                </Button>

                <Button onClick={openSheet}>Create</Button>
            </div>
        </div>
    );
}
