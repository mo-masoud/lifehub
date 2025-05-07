import { __ } from '@/lib/i18n';
import { formatNumber } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Repeat } from 'lucide-react';

export const TopTransactionStats = ({
    stats,
    dir,
    currentMonth,
}: {
    stats: Record<string, any>;
    dir: 'in' | 'out' | 'transfer';
    currentMonth: string;
}) => {
    const renderHeader = () => {
        let dirWithIcon = (
            <span className="inline-flex items-center text-xs text-blue-500 lg:text-base">
                <Repeat className="size-4" />
            </span>
        );

        if (dir === 'in') {
            dirWithIcon = <span className="text-green-500">▼</span>;
        } else if (dir === 'out') {
            dirWithIcon = <span className="text-red-500">▲</span>;
        }

        return (
            <>
                <span className="inline-flex items-center gap-x-1.5">
                    Top {dirWithIcon} {currentMonth}
                </span>
            </>
        );
    };

    const renderSingleStat = (stat: any) => {
        if (dir === 'in') {
            return stat ? (
                <div className="inline-flex items-center text-xs font-semibold">
                    ({stat?.amount}){' '}
                    <span className="inline-flex items-center text-green-500">
                        <ArrowRight className="size-4" /> {__(stat?.location)}
                    </span>
                </div>
            ) : (
                <span className="text-muted-foreground text-xs">N\A</span>
            );
        }

        if (dir === 'out') {
            return stat ? (
                <div className="inline-flex items-center text-xs font-semibold">
                    ({formatNumber(stat?.amount)}){' '}
                    <span className="inline-flex items-center text-red-500">
                        <ArrowLeft className="size-4" /> {__(stat?.location)}
                    </span>
                </div>
            ) : (
                <span className="text-muted-foreground text-xs">N\A</span>
            );
        }

        return stat ? (
            <div className="inline-flex items-center text-xs font-semibold">
                ({stat?.amount}){' '}
                <span className="inline-flex items-center text-red-500">
                    <ArrowLeft className="size-4" /> {__(stat?.location)}
                </span>
            </div>
        ) : (
            <span className="text-muted-foreground text-xs">N\A</span>
        );
    };

    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-auto rounded-xl border">
            <div className="absolute inset-0 flex size-full flex-col">
                <div className="border-b p-4">{renderHeader()}</div>

                <div className="grid w-full flex-1 grid-cols-2 grid-rows-2">
                    <div className="bg-card hover:bg-muted flex w-full flex-col items-center justify-center border p-4 transition-colors duration-300 ease-out">
                        <div className="mb-2 text-xs font-bold lg:text-lg">{__('savings.usd')}</div>
                        {renderSingleStat(stats?.USD)}
                    </div>
                    <div className="bg-card hover:bg-muted flex w-full flex-col items-center justify-center border p-4 transition-colors duration-300 ease-out">
                        <div className="mb-2 text-xs font-bold lg:text-lg">{__('savings.egp')}</div>
                        {renderSingleStat(stats?.EGP)}
                    </div>
                    <div className="bg-card hover:bg-muted flex w-full flex-col items-center justify-center border p-4 transition-colors duration-300 ease-out">
                        <div className="mb-2 text-xs font-bold lg:text-lg">{__('savings.gold24')}</div>
                        {renderSingleStat(stats?.GOLD24)}
                    </div>
                    <div className="bg-card hover:bg-muted flex w-full flex-col items-center justify-center border p-4 transition-colors duration-300 ease-out">
                        <div className="mb-2 text-xs font-bold lg:text-lg">{__('savings.gold21')}</div>
                        {renderSingleStat(stats?.GOLD21)}
                    </div>
                </div>
            </div>
        </div>
    );
};
