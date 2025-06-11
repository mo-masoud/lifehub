import { PasswordStatsData } from '@/types/passwords';
import { PasswordTypeDistribution } from './password-type-distribution';
import { SecurityHealthOverview } from './security-health-overview';
import { TopCopiedPasswords } from './top-copied-passwords';

interface PasswordStatsDashboardProps {
    stats: PasswordStatsData;
}

export function PasswordStatsDashboard({ stats }: PasswordStatsDashboardProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PasswordTypeDistribution data={stats.type_distribution} />
            <TopCopiedPasswords data={stats.top_copied_passwords} totalCopied={stats.total_copied_count} />
            <div className="sm:col-span-2 lg:col-span-1">
                <SecurityHealthOverview data={stats.security_health} />
            </div>
        </div>
    );
}
