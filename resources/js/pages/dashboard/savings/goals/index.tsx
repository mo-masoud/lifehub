import { ActionCell } from '@/components/dashboard/action-cell';
import { CreateItem } from '@/components/dashboard/create-item';
import { Heading } from '@/components/dashboard/heading';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/dashboard/app-layout';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { SavingsGoalForm } from '@/pages/dashboard/savings/goals/savings-goal-form';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Goal } from 'lucide-react';
import { toast } from 'sonner';

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
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: __('general.dashboard'),
        href: route('dashboard.home'),
    },
    {
        title: __('savings.goals'),
        href: route('dashboard.savings.goals.index'),
    },
];

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'low':
            return 'bg-blue-100 text-blue-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'high':
            return 'bg-orange-100 text-orange-800';
        case 'very-high':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusBadge = (goal: SavingsGoal) => {
    if (goal.is_achieved) {
        return <Badge className="bg-green-100 text-green-800">Achieved</Badge>;
    }
    if (goal.is_overdue) {
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
};

export default function SavingsGoalsIndex({ goals }: Props) {
    const destroy = (id: string) => {
        router.delete(route('dashboard.savings.goals.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(__('messages.deleted_successfully'));
            },
            onError: (e) => {
                toast.error(e[0]);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('savings.goals')} />

            <div className="mt-4 flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Goal className="text-primary size-5" />
                    <Heading title={__('savings.goals')} />
                </div>

                <CreateItem label="Create Savings Goal" FormComponent={SavingsGoalForm} />
            </div>

            <div className="mt-4 px-4">
                <Card className="p-0 pb-2">
                    <Table>
                        {goals.length === 0 && <TableCaption>No savings goals found.</TableCaption>}
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="text-start text-xs ltr:rounded-tl-xl rtl:rounded-tr-xl">Goal</TableHead>
                                <TableHead className="text-start text-xs">Target Amount</TableHead>
                                <TableHead className="text-start text-xs">Progress</TableHead>
                                <TableHead className="text-start text-xs">Priority</TableHead>
                                <TableHead className="text-start text-xs">Target Date</TableHead>
                                <TableHead className="text-start text-xs">Status</TableHead>
                                <TableHead className="text-end text-xs ltr:rounded-tr-xl rtl:rounded-tl-xl">
                                    <span className="sr-only">{__('words.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {goals.map((goal) => (
                                <TableRow key={goal.id}>
                                    <TableCell className="text-start text-sm font-medium">{goal.title}</TableCell>
                                    <TableCell className="text-start text-sm">
                                        <div>
                                            ${formatNumber(goal.target_amount_usd)}
                                            <span className="text-muted-foreground block text-xs">{formatNumber(goal.target_amount_egp)} EGP</span>
                                            {goal.safety_margin_percentage > 0 && (
                                                <span className="block text-xs text-purple-600 dark:text-purple-400">
                                                    Effective: ${formatNumber(goal.effective_target_amount_usd)}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-start text-sm">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>${formatNumber(goal.current_amount_usd)}</span>
                                                <span>{Math.round(goal.progress_percentage)}%</span>
                                            </div>
                                            <Progress value={goal.progress_percentage} className="h-2" />

                                            {goal.safety_margin_percentage > 0 && (
                                                <>
                                                    <div className="flex justify-between text-xs text-purple-600 dark:text-purple-400">
                                                        <span>w/ {goal.safety_margin_percentage}% margin</span>
                                                        <span>{Math.round(goal.effective_progress_percentage)}%</span>
                                                    </div>
                                                    <Progress value={goal.effective_progress_percentage} className="h-1.5 opacity-60" />
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-start text-sm">
                                        <Badge className={getSeverityColor(goal.severity)}>{goal.severity.replace('-', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-start text-sm">
                                        {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'No date set'}
                                    </TableCell>
                                    <TableCell className="text-start text-sm">{getStatusBadge(goal)}</TableCell>
                                    <ActionCell
                                        updateLabel="Update Goal"
                                        item={{ goal }}
                                        FormComponent={SavingsGoalForm}
                                        onDestroy={() => destroy(goal.id.toString())}
                                    />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}
