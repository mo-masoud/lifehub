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
    goal?: SavingsGoal;
    onSave?: () => void;
}

const goalSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
    target_amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    currency: z.enum(['USD', 'EGP']),
    severity: z.enum(['low', 'medium', 'high', 'very-high']),
    target_date: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export function SavingsGoalForm({ goal, onSave }: SavingsGoalFormProps) {
    const isEditing = !!goal?.id;
    const goalData = goal;

    // Determine the currency and amount based on existing data
    const getInitialCurrencyAndAmount = () => {
        if (!goalData) {
            return { currency: 'USD' as const, amount: 0 };
        }

        // If EGP amount exists and USD doesn't, use EGP
        if (goalData.target_amount_egp > 0 && goalData.target_amount_usd === 0) {
            return { currency: 'EGP' as const, amount: Number(goalData.target_amount_egp) };
        }

        // Default to USD
        return { currency: 'USD' as const, amount: Number(goalData.target_amount_usd) };
    };

    const { currency: initialCurrency, amount: initialAmount } = getInitialCurrencyAndAmount();

    const form = useForm<GoalFormData>({
        resolver: zodResolver(goalSchema),
        defaultValues: {
            title: goalData?.title || '',
            target_amount: initialAmount,
            currency: initialCurrency,
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
                                    value={field.value || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Convert to number, ensuring empty string becomes 0
                                        const numericValue = value === '' ? 0 : parseFloat(value);
                                        field.onChange(isNaN(numericValue) ? 0 : numericValue);
                                    }}
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

                <div className="flex items-center justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : isEditing ? __('messages.update') : __('messages.save')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
