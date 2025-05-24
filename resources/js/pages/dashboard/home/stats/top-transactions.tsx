import { Button } from '@/components/ui/button';
import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { ArrowDown, ArrowLeftRight, Calendar, Tag, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
    amount: number;
    amount_egp: number;
    amount_usd: number;
    date: string;
    category: string | null;
    category_id: number | null;
    notes: string | null;
    period: string;
    type: string;
}

interface TopTransactionsProps {
    transactions: {
        week: Transaction | null;
        month: Transaction | null;
        quarter: Transaction | null;
        year: Transaction | null;
    };
}

type PeriodType = 'week' | 'month' | 'quarter' | 'year';

export default function TopTransactions({ transactions }: TopTransactionsProps) {
    const [activePeriod, setActivePeriod] = useState<PeriodType>('week');

    const periodTitles = {
        week: __('stats.period_week'),
        month: __('stats.period_month'),
        quarter: __('stats.period_quarter'),
        year: __('stats.period_year'),
    };

    const transaction = transactions[activePeriod];

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
            <div className="flex w-full items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <TrendingUp className="size-4" />
                    </span>
                    <h3 className="text-sm font-bold">{__('stats.top_transaction')}</h3>
                </div>

                <Button size="icon" className="size-7" variant="outline">
                    <ArrowLeftRight />
                </Button>
            </div>
            <div className="border-b bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
                <div className="flex">
                    {(['week', 'month', 'quarter', 'year'] as PeriodType[]).map((period) => (
                        <button
                            key={period}
                            onClick={() => setActivePeriod(period)}
                            className={`relative flex-1 px-3 py-2 text-xs font-medium transition-all ${
                                activePeriod === period
                                    ? 'text-primary'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                            }`}
                        >
                            {periodTitles[period]}
                            {activePeriod === period && <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-full" />}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow p-4">
                {transaction ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                    <ArrowDown className="size-4" />
                                </div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{__('stats.amount')}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                                    {formatNumber(Math.floor(transaction.amount_egp))} {__('transactions.egp')}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {formatNumber(Math.floor(transaction.amount_usd))} {__('transactions.usd')}
                                </span>
                            </div>
                        </div>

                        {transaction.category && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        <Tag className="size-4" />
                                    </div>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{__('stats.category')}</span>
                                </div>
                                <span className="text-sm font-medium">{__(transaction.category)}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                    <Calendar className="size-4" />
                                </div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{__('stats.date')}</span>
                            </div>
                            <span className="text-sm">{transaction.date}</span>
                        </div>

                        {transaction.notes && (
                            <div className="mt-3 rounded-md bg-zinc-50 p-2 dark:bg-zinc-900">
                                <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{transaction.notes}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-24 items-center justify-center">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{__('stats.no_transactions')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
