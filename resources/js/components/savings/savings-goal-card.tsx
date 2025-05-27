import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { AlertTriangle, Calendar, CheckCircle2, X } from 'lucide-react';
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

interface Props {
    goal: SavingsGoal;
    compact?: boolean;
    showActions?: boolean;
    onEdit?: (goal: SavingsGoal) => void;
}

export const SavingsGoalCard = ({ goal, compact = false, showActions = true, onEdit }: Props) => {
    const getSeverityColor = () => {
        switch (goal.severity) {
            case 'low':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'very-high':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const handleMarkAsAchieved = () => {
        router.post(
            route('dashboard.savings.goals.mark-achieved', goal.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(__('Goal marked as achieved!'));
                },
                onError: () => {
                    toast.error(__('messages.something_went_wrong'));
                },
            },
        );
    };

    const handleDelete = () => {
        if (confirm(__('Are you sure you want to delete this goal?'))) {
            router.delete(route('dashboard.savings.goals.destroy', goal.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(__('messages.deleted_successfully'));
                },
                onError: () => {
                    toast.error(__('messages.something_went_wrong'));
                },
            });
        }
    };

    if (compact) {
        return (
            <div className="rounded-lg border bg-white p-3 dark:bg-zinc-950">
                <div className="mb-2 flex items-center justify-between">
                    <h4 className="truncate text-sm font-medium">{goal.title}</h4>
                    <Badge className={`text-xs ${getSeverityColor()}`}>{__(goal.severity)}</Badge>
                </div>

                <div className="space-y-2">
                    <Progress value={goal.progress_percentage} className="h-2" />

                    <div className="text-muted-foreground flex justify-between text-xs">
                        <span>
                            {formatNumber(goal.current_amount_usd)} $ / {formatNumber(goal.target_amount_usd)} $
                        </span>
                        <span>{goal.progress_percentage}%</span>
                    </div>

                    {goal.target_date && (
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(goal.target_date).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-white p-4 dark:bg-zinc-950">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{goal.title}</h3>
                        {goal.is_achieved && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {goal.is_overdue && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </div>

                    <div className="mb-2 flex items-center gap-2">
                        <Badge className={getSeverityColor()}>
                            {__(goal.severity)} {__('Priority')}
                        </Badge>

                        {goal.target_date && (
                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(goal.target_date).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {showActions && (
                    <div className="flex items-center gap-1">
                        {!goal.is_achieved && (
                            <Button size="sm" variant="outline" onClick={handleMarkAsAchieved}>
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                        )}

                        {onEdit && (
                            <Button size="sm" variant="outline" onClick={() => onEdit(goal)}>
                                {__('Edit')}
                            </Button>
                        )}

                        <Button size="sm" variant="outline" onClick={handleDelete}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Progress */}
            <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{__('Progress')}</span>
                    <span className="text-sm font-bold">{goal.progress_percentage}%</span>
                </div>

                <Progress value={goal.progress_percentage} className="h-3" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-muted-foreground">{__('Current Amount')}</div>
                        <div className="font-semibold">
                            <span className="text-green-600 dark:text-green-400">{formatNumber(goal.current_amount_usd)} $</span>
                            <span className="text-muted-foreground ml-1 text-xs">({formatNumber(goal.current_amount_egp)} £)</span>
                        </div>
                    </div>

                    <div>
                        <div className="text-muted-foreground">{__('Target Amount')}</div>
                        <div className="font-semibold">
                            <span className="text-blue-600 dark:text-blue-400">{formatNumber(goal.target_amount_usd)} $</span>
                            <span className="text-muted-foreground ml-1 text-xs">({formatNumber(goal.target_amount_egp)} £)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {goal.is_achieved && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {__('Goal achieved!')} {goal.achieved_at && new Date(goal.achieved_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            )}

            {goal.is_overdue && !goal.is_achieved && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                    <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">{__('Goal is overdue!')}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
