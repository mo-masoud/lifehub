import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { FileText, RefreshCcw } from 'lucide-react';
import { FC } from 'react';

export const AuditLogsHeader: FC = () => {
    return (
        <div className="flex items-center justify-between">
            <Heading title="Audit Logs" description="View password activity history and security events." icon={FileText} />

            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild size="icon" className="hidden md:inline-flex">
                    <Link href={route('passwords.audit-logs.index')} prefetch>
                        <RefreshCcw className="size-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
};
