import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { CalendarDays, Plus, Target } from 'lucide-react';

interface SavingsGoal {
    id: number;
    title: string;
    target_amount_usd: number;
    target_amount_egp: number;
    current_amount_usd: number;
    current_amount_egp: number;
    effective_target_amount_usd: number;
    effective_target_amount_egp: number;
    safety_margin_percentage: number;
    safety_margin_amount_usd: number;
    safety_margin_amount_egp: number;
    progress_percentage: number;
    effective_progress_percentage: number;
    severity: 'low' | 'medium' | 'high' | 'very-high';
    target_date: string | null;
    is_achieved: boolean;
    is_overdue: boolean;
    achieved_at: string | null;
}

interface Props {
    goals: SavingsGoal[];
    totalUsd: number;
    totalEgp: number;
}

export const SavingsGoalsWidget = ({ goals, totalUsd }: Props) => {
    const importantGoals = goals
        .filter(
            (goal) =>
                goal.severity === 'high' ||
                goal.severity === 'very-high' ||
                (goal.target_date && new Date(goal.target_date) <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)), // within 60 days
        )
        .slice(0, 3);

    const totalTargetUsd = goals.reduce((sum, goal) => sum + goal.target_amount_usd, 0);
    const overallProgress = totalTargetUsd > 0 ? Math.min(100, (totalUsd / totalTargetUsd) * 100) : 0;

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'very-high':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const handleGoToGoals = () => {
        router.get(route('dashboard.savings.goals.index'));
    };

    const handleCreateGoal = () => {
        router.get(
            route('dashboard.savings.goals.index'),
            {},
            {
                onSuccess: () => {
                    // You can add logic to open create modal here
                },
            },
        );
    };

    if (goals.length === 0) {
        return (
            <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
                <div className="flex items-center justify-between border-b px-4 py-2">
                    <div className="flex items-center gap-2">
                        <div className="mr-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <Target className="size-4" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{__('Savings Goals')}</h3>
                    </div>
                    <Button size="icon" className="size-7" variant="outline" onClick={handleCreateGoal}>
                        <Plus className="size-4" />
                    </Button>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <Target className="text-muted-foreground mb-3 size-8" />
                    <p className="text-muted-foreground mb-3 text-sm">{__('No savings goals yet')}</p>
                    <Button size="sm" onClick={handleCreateGoal}>
                        {__('Create Your First Goal')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-2">
                    <div className="mr-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <Target className="size-4" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{__('Savings Goals')}</h3>
                </div>
                <Button size="icon" className="size-7" variant="outline" onClick={handleGoToGoals}>
                    <Plus className="size-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Overall Progress */}
                {totalTargetUsd > 0 && (
                    <div className="mb-4 rounded-lg border border-dashed border-gray-200 p-3 dark:border-gray-700">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{__('Overall Progress')}</span>
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{overallProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-2" />
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            ${formatNumber(totalUsd)} / ${formatNumber(totalTargetUsd)}
                        </div>
                    </div>
                )}

                {/* Important Goals */}
                <div className="space-y-3">
                    {importantGoals.map((goal) => (
                        <div key={goal.id} className="rounded-lg border bg-gray-50/50 p-3 dark:bg-gray-900/50">
                            <div className="mb-2 flex items-start justify-between">
                                <h4 className="text-sm leading-tight font-medium">{goal.title}</h4>
                                <Badge className={`ml-2 text-xs ${getSeverityColor(goal.severity)}`}>{__(goal.severity)}</Badge>
                            </div>

                            <div className="mb-2 space-y-1">
                                <Progress value={goal.progress_percentage} className="h-1.5" />

                                {goal.safety_margin_percentage > 0 && (
                                    <Progress value={goal.effective_progress_percentage} className="h-1 opacity-60" />
                                )}
                            </div>

                            <div className="space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        ${formatNumber(goal.current_amount_usd)} / ${formatNumber(goal.target_amount_usd)}
                                    </span>
                                    <span className="font-medium">{goal.progress_percentage.toFixed(1)}%</span>
                                </div>

                                {goal.safety_margin_percentage > 0 && (
                                    <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400">
                                        <span className="text-xs">
                                            w/ {goal.safety_margin_percentage}% margin: ${formatNumber(goal.effective_target_amount_usd)}
                                        </span>
                                        <span className="font-medium">{goal.effective_progress_percentage?.toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>

                            {goal.target_date && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <CalendarDays className="size-3" />
                                    <span className={goal.is_overdue ? 'text-red-600 dark:text-red-400' : ''}>
                                        {new Date(goal.target_date).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {goals.length > importantGoals.length && (
                    <Button variant="ghost" size="sm" className="mt-3 w-full text-xs" onClick={handleGoToGoals}>
                        {__('View All Goals')} ({goals.length})
                    </Button>
                )}
            </div>
        </div>
    );
};
