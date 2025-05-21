import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { useState } from 'react';

interface Transaction {
    amount: number;
    date: string;
    category: string | null;
    category_id: number | null;
    notes: string | null;
    period: string;
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
            <div className="flex items-center border-b px-4 py-2">
                <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                    </svg>
                </div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{__('stats.top_transaction')}</h3>
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
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <polyline points="19 12 12 19 5 12"></polyline>
                                    </svg>
                                </div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{__('stats.amount')}</span>
                            </div>
                            <span className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                                {formatNumber(Math.floor(transaction.amount))}
                            </span>
                        </div>

                        {transaction.category && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M20 6H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
                                            <path d="M2 10h20" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{__('stats.category')}</span>
                                </div>
                                <span className="text-sm font-medium">{transaction.category}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
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
