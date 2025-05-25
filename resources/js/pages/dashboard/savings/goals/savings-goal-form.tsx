import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { __ } from '@/lib/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface SavingsGoal {
    id: number;
    title: string;
    target_amount_usd: number;
    target_amount_egp: number;
    severity: 'low' | 'medium' | 'high' | 'very-high';
    target_date: string | null;
}

interface SavingsGoalFormProps {
    goal?: { goal: SavingsGoal };
    onSave?: () => void;
}

const goalSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
    target_amount: z.number().min(0.01, 'Amount must be greater than 0'),
    currency: z.enum(['USD', 'EGP']),
    severity: z.enum(['low', 'medium', 'high', 'very-high']),
    target_date: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export function SavingsGoalForm({ goal, onSave }: SavingsGoalFormProps) {
    const isEditing = !!goal?.goal;
    const goalData = goal?.goal;

    const form = useForm<GoalFormData>({
        resolver: zodResolver(goalSchema),
        defaultValues: {
            title: goalData?.title || '',
            target_amount: goalData?.target_amount_usd || 0,
            currency: 'USD',
            severity: goalData?.severity || 'medium',
            target_date: goalData?.target_date || '',
        },
    });

    const handleSubmit = (data: GoalFormData) => {
        const formData = {
            title: data.title,
            target_amount: data.target_amount,
            currency: data.currency,
            severity: data.severity,
            target_date: data.target_date || null,
        };

        if (isEditing && goalData) {
            router.patch(route('dashboard.savings.goals.update', goalData.id), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(__('messages.updated_successfully'));
                    onSave?.();
                },
                onError: (errors) => {
                    Object.keys(errors).forEach((key) => {
                        form.setError(key as keyof GoalFormData, {
                            type: 'server',
                            message: errors[key],
                        });
                    });
                },
            });
        } else {
            router.post(route('dashboard.savings.goals.store'), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(__('messages.created_successfully'));
                    form.reset();
                    onSave?.();
                },
                onError: (errors) => {
                    Object.keys(errors).forEach((key) => {
                        form.setError(key as keyof GoalFormData, {
                            type: 'server',
                            message: errors[key],
                        });
                    });
                },
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{__('fields.name')}</FormLabel>
                            <FormControl>
                                <Input placeholder="Goal title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="target_amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{__('savings.amount')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="USD">{__('savings.USD')}</SelectItem>
                                        <SelectItem value="EGP">{__('savings.EGP')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="very-high">Very High</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="target_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Target Date (Optional)</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : isEditing ? __('messages.update') : __('messages.save')}
                </Button>
            </form>
        </Form>
    );
}
