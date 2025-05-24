import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { DollarSign } from 'lucide-react';
import { useState } from 'react';

interface TotalIncomeProps {
    income: {
        week: number;
        month: number;
        quarter: number;
        year: number;
    };
}

type PeriodType = 'quarter' | 'year';

export default function TotalIncome({ income }: TotalIncomeProps) {
    const [activePeriod, setActivePeriod] = useState<PeriodType>('quarter');

    const periodTitles = {
        month: __('stats.period_month'),
        quarter: __('stats.period_quarter'),
        year: __('stats.period_year'),
    };

    const amount = income[activePeriod];

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
            <div className="flex items-center border-b px-4 py-2">
                <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <DollarSign className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{__('stats.total_income')}</h3>
            </div>
            <div className="border-b bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
                <div className="flex">
                    {(['quarter', 'year'] as PeriodType[]).map((period) => (
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
            <div className="flex flex-grow flex-col justify-center p-4">
                {amount > 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="12" y1="19" x2="12" y2="5"></line>
                                <polyline points="5 12 12 5 19 12"></polyline>
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">{__('stats.total_income')}</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatNumber(Math.floor(amount))}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{`${__('stats.period_' + activePeriod)}`}</p>
                    </div>
                ) : (
                    <div className="flex h-32 items-center justify-center">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{__('stats.no_income')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
