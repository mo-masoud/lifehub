import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { type CategoryExpense, type TopCategoriesByPeriod } from '@/types/dashboard';
import { Tag, TrendingDown } from 'lucide-react';
import { useState } from 'react';

interface TopCategoriesExpensesProps {
    topCategories: TopCategoriesByPeriod;
}

type PeriodType = 'week' | 'month' | 'quarter' | 'year' | 'overall';

// Helper function to get chart stroke colors for SVG
const getStrokeColor = (index: number): string => {
    const colors = [
        '#a855f7', // purple-500
        '#ec4899', // pink-500
        '#6366f1', // indigo-500
        '#f59e0b', // amber-500
        '#10b981', // emerald-500
        '#ef4444', // red-500
        '#8b5cf6', // violet-500
        '#06b6d4', // cyan-500
        '#f97316', // orange-500
        '#84cc16', // lime-500
    ];
    return colors[index] || '#6b7280';
};

// Pie Chart Component (Filled Circle)
const PieChart = ({ categories }: { categories: CategoryExpense[] }) => {
    const total = categories.reduce((sum, cat) => sum + cat.total_egp, 0);
    const size = 180;
    const radius = 85;
    const centerX = size / 2;
    const centerY = size / 2;

    // Show only top 3 categories and group all others as "Other"
    const maxCategories = 3;
    const mainCategories = categories.slice(0, maxCategories);
    const otherCategories = categories.slice(maxCategories);
    const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.total_egp, 0);

    const displayCategories = [
        ...mainCategories,
        ...(otherTotal > 0
            ? [
                  {
                      id: 'other',
                      name: 'other_categories',
                      total_egp: otherTotal,
                      total_usd: otherCategories.reduce((sum, cat) => sum + cat.total_usd, 0),
                  },
              ]
            : []),
    ];

    let cumulativeAngle = 0;

    // Generate path for each slice
    const createSlicePath = (percentage: number, startAngle: number) => {
        if (percentage === 100) {
            // Full circle
            return `M ${centerX} ${centerY} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
        }

        const angle = (percentage / 100) * 2 * Math.PI;
        const endAngle = startAngle + angle;

        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        const largeArcFlag = angle > Math.PI ? 1 : 0;

        return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transition-all duration-300">
                {/* Data slices */}
                {displayCategories.map((category, index) => {
                    const percentage = (category.total_egp / total) * 100;
                    const startAngle = cumulativeAngle * (Math.PI / 180);
                    const path = createSlicePath(percentage, startAngle);

                    cumulativeAngle += (percentage / 100) * 360;

                    return (
                        <path
                            key={category.id}
                            d={path}
                            fill={getStrokeColor(index)}
                            stroke="#ffffff"
                            strokeWidth="1"
                            className="transition-all duration-300 hover:opacity-80"
                        />
                    );
                })}
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-semibold text-white drop-shadow-md">{formatNumber(Math.floor(total))}</span>
                <span className="text-xs text-white/90 drop-shadow-md">{__('savings.egp')}</span>
            </div>
        </div>
    );
};

export const TopCategoriesExpenses = ({ topCategories }: TopCategoriesExpensesProps) => {
    const [activePeriod, setActivePeriod] = useState<PeriodType>('overall');

    const periodTitles = {
        week: __('stats.period_week'),
        month: __('stats.period_month'),
        quarter: __('stats.period_quarter'),
        year: __('stats.period_year'),
        overall: __('stats.period_overall'),
    };

    const categories = topCategories[activePeriod];

    return (
        <div className="flex h-full flex-col rounded-lg border bg-white shadow-xs dark:bg-zinc-950">
            {/* Header */}
            <div className="flex items-center border-b px-4 py-2">
                <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <TrendingDown className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{__('stats.top_categories_expenses')}</h3>
            </div>

            {/* Period Tabs */}
            <div className="border-b bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
                <div className="flex">
                    {(['overall', 'week', 'month', 'quarter', 'year'] as PeriodType[]).map((period) => (
                        <button
                            key={period}
                            onClick={() => setActivePeriod(period)}
                            className={`relative flex-1 px-2 py-2 text-xs font-medium transition-all ${
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

            {/* Content Grid: 2 rows on mobile/large, 2 columns on small screens */}
            <div className="flex flex-1 flex-col gap-4 p-4 sm:flex-row lg:flex-col">
                {/* First Section: Top 3 Categories */}
                <div className="flex flex-1 flex-col">
                    <h4 className="mb-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">{__('stats.top_categories_expenses')}</h4>
                    {categories && categories.length > 0 ? (
                        <div className="space-y-3">
                            {categories.slice(0, 3).map((category, index) => (
                                <div key={category.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-400">
                                            <span className="text-sm font-bold">{index + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Tag className="size-4 text-zinc-500" />
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{__(category.name)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            {formatNumber(Math.floor(category.total_egp))} {__('savings.egp')}
                                        </span>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {formatNumber(Math.floor(category.total_usd))} {__('savings.usd')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-24 items-center justify-center">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{__('stats.no_expenses')}</p>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t sm:border-t-0 sm:border-l lg:border-t lg:border-l-0"></div>

                {/* Second Section: Split into Chart and All Categories */}
                <div className="flex min-h-[300px] flex-1 flex-col gap-4 lg:flex-row">
                    {/* Chart Section */}
                    <div className="flex flex-1 flex-col">
                        <h4 className="mb-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">{__('stats.expense_distribution')}</h4>
                        {categories && categories.length > 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center">
                                {/* Pie Chart */}
                                <div className="relative mb-3">
                                    <PieChart categories={categories} />
                                </div>

                                {/* Compact Legend */}
                                <div className="grid w-full max-w-xs grid-cols-2 grid-rows-2 gap-2">
                                    {categories.slice(0, 3).map((category, index) => (
                                        <div key={category.id} className="flex items-center justify-start gap-1">
                                            <div className={`h-2 w-2 rounded-full`} style={{ backgroundColor: getStrokeColor(index) }} />
                                            <span className="text-xs text-zinc-600 dark:text-zinc-400">{__(category.name)}</span>
                                        </div>
                                    ))}
                                    {categories.length > 3 && (
                                        <div className="flex items-center justify-start gap-1">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getStrokeColor(3) }} />
                                            <span className="text-xs text-zinc-600 dark:text-zinc-400">{__('stats.other_categories')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-8">
                                <p className="text-sm text-zinc-500">{__('stats.no_expenses')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
