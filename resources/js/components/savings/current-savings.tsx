import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { CalendarDays, Goal, HandCoins, RefreshCcw, Target } from 'lucide-react';
import { toast } from 'sonner';

interface SavingsGoal {
    id: number;
    title: string;
    target_amount_usd: number;
    target_amount_egp: number;
    current_amount_usd: number;
    current_amount_egp: number;
    progress_percentage: number;
    severity: 'low' | 'medium' | 'high' | 'very-high';
    target_date: string | null;
    is_achieved: boolean;
    is_overdue: boolean;
    achieved_at: string | null;
}

interface CurrentSavingsProps {
    date: string;
    totalEgp: number;
    totalUsd: number;
    savingsGoals?: SavingsGoal[];
}

export const CurrentSavings = ({ date, totalEgp, totalUsd, savingsGoals = [] }: CurrentSavingsProps) => {
    const newSnapshot = () => {
        router.post(
            route('dashboard.savings.snapshots.store'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(__('messages.created_successfully'));
                },
                onError: () => {
                    toast.error(__('messages.something_went_wrong'));
                },
            },
        );
    };

    // Get the most important goal (highest priority + near deadline)
    const importantGoal = savingsGoals
        .filter((goal) => !goal.is_achieved)
        .sort((a, b) => {
            // Priority: very-high > high > medium > low
            const priorityOrder = { 'very-high': 4, high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.severity] || 1;
            const bPriority = priorityOrder[b.severity] || 1;

            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }

            // If same priority, prioritize by deadline
            if (a.target_date && b.target_date) {
                return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
            }

            // If one has deadline and other doesn't, prioritize the one with deadline
            if (a.target_date && !b.target_date) return -1;
            if (!a.target_date && b.target_date) return 1;

            return 0;
        })[0];

    const totalTargetUsd = savingsGoals.reduce((sum, goal) => sum + goal.target_amount_usd, 0);
    const overallProgress = totalTargetUsd > 0 ? Math.min(100, (totalUsd / totalTargetUsd) * 100) : 0;

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-2">
                    <div className="mr-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <HandCoins className="size-4" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{__('stats.current_savings')}</h3>
                </div>

                <Button size="icon" className="size-7" variant="outline" onClick={newSnapshot}>
                    <RefreshCcw className="size-4" />
                </Button>
            </div>

            <div className="flex flex-1 gap-3 p-4 xl:gap-2 xl:p-3">
                {/* Current Savings Column */}
                <div className="flex flex-1 flex-col justify-center space-y-3 xl:space-y-2">
                    {/* EGP Amount */}
                    <div className="text-center">
                        <div className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">EGP</div>
                        <div className="text-lg font-bold text-amber-600 xl:text-xl dark:text-amber-400">{formatNumber(Math.floor(totalEgp))} £</div>
                    </div>

                    {/* USD Amount */}
                    <div className="text-center">
                        <div className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">USD</div>
                        <div className="text-lg font-bold text-green-600 xl:text-xl dark:text-green-400">{formatNumber(Math.floor(totalUsd))} $</div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-center gap-1">
                        <CalendarDays className="text-primary size-3" />
                        <span className="text-muted-foreground text-xs font-medium">
                            {__('stats.as_of')} {date}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px bg-zinc-200 dark:bg-zinc-700"></div>

                {/* Goals Column */}
                <div className="flex flex-1 flex-col justify-center space-y-3 xl:space-y-2">
                    {savingsGoals.length > 0 ? (
                        <>
                            {/* Overall Goal Progress */}
                            {totalTargetUsd > 0 && (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{__('Overall Progress')}</span>
                                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{overallProgress.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={overallProgress} className="h-1.5" />
                                    <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                                        ${formatNumber(Math.floor(totalUsd))} / ${formatNumber(Math.floor(totalTargetUsd))}
                                    </div>
                                </div>
                            )}

                            {/* Most Important Goal */}
                            {importantGoal && (
                                <div className="rounded border border-dashed border-zinc-200 bg-zinc-50/50 p-2 dark:border-zinc-700 dark:bg-zinc-900/50">
                                    <div className="mb-1 flex items-center gap-1">
                                        <Goal className="size-3 text-blue-600 dark:text-blue-400" />
                                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{__('Priority Goal')}</span>
                                    </div>
                                    <div className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">{importantGoal.title}</div>
                                    <Progress value={importantGoal.progress_percentage} className="mb-1 h-1" />
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-600 dark:text-zinc-400">
                                            ${formatNumber(Math.floor(importantGoal.current_amount_usd))}
                                        </span>
                                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                            {importantGoal.progress_percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    {importantGoal.target_date && (
                                        <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                                            <CalendarDays className="size-3" />
                                            <span className={importantGoal.is_overdue ? 'text-red-600 dark:text-red-400' : ''}>
                                                {new Date(importantGoal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center">
                            <Target className="mb-1 size-6 text-zinc-400" />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{__('No goals set')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
