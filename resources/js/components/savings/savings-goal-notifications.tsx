import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
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
    success_notification_dismissed: boolean;
    success_notification_shown_at: string | null;
}

interface Props {
    goals: SavingsGoal[];
}

export const SavingsGoalNotifications = ({ goals }: Props) => {
    // Success notifications (achieved goals)
    const successGoals = goals.filter((goal) => {
        if (!goal.is_achieved || goal.success_notification_dismissed) {
            return false;
        }

        // Show for 3 months after achievement
        if (goal.success_notification_shown_at) {
            const shownAt = new Date(goal.success_notification_shown_at);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return shownAt > threeMonthsAgo;
        }

        return true;
    });

    // Failure notifications (overdue goals)
    const failureGoals = goals.filter((goal) => goal.is_overdue && !goal.is_achieved);

    const handleDismissSuccess = (goalId: number) => {
        router.post(
            route('dashboard.savings.goals.dismiss-notification', goalId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(__('Notification dismissed'));
                },
                onError: () => {
                    toast.error(__('messages.something_went_wrong'));
                },
            },
        );
    };

    const handleGoToGoals = () => {
        router.get(route('dashboard.savings.goals.index'));
    };

    if (successGoals.length === 0 && failureGoals.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {/* Success Notifications */}
            {successGoals.map((goal) => (
                <Alert key={`success-${goal.id}`} className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="font-medium text-green-800 dark:text-green-300">🎉 {__('Congratulations! Goal Achieved')}</div>
                            <div className="mt-1 text-sm text-green-700 dark:text-green-400">
                                <strong>"{goal.title}"</strong> - ${formatNumber(goal.target_amount_usd)}
                                {goal.achieved_at && (
                                    <span className="ml-1">
                                        ({__('achieved on')} {new Date(goal.achieved_at).toLocaleDateString()})
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-800"
                                onClick={handleGoToGoals}
                            >
                                {__('View Goals')}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-800"
                                onClick={() => handleDismissSuccess(goal.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            ))}

            {/* Failure Notifications */}
            {failureGoals.map((goal) => (
                <Alert key={`failure-${goal.id}`} className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="font-medium text-red-800 dark:text-red-300">⚠️ {__('Goal Deadline Passed')}</div>
                            <div className="mt-1 text-sm text-red-700 dark:text-red-400">
                                <strong>"{goal.title}"</strong> - {goal.progress_percentage.toFixed(1)}% complete
                                {goal.target_date && (
                                    <span className="ml-1">
                                        ({__('deadline was')} {new Date(goal.target_date).toLocaleDateString()})
                                    </span>
                                )}
                            </div>
                            <div className="mt-1 text-xs text-red-600 dark:text-red-500">
                                ${formatNumber(goal.current_amount_usd)} / ${formatNumber(goal.target_amount_usd)}
                                <span className="ml-1">
                                    ({__('$:amount remaining', { amount: formatNumber(goal.target_amount_usd - goal.current_amount_usd) })})
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-800"
                                onClick={handleGoToGoals}
                            >
                                {__('Update Goal')}
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            ))}
        </div>
    );
};
