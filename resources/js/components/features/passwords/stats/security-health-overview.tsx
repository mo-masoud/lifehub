import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { Cell, Label, Pie, PieChart } from 'recharts';

interface SecurityHealthOverviewProps {
    data: {
        strong: number;
        medium: number;
        weak: number;
    };
}

const chartConfig = {
    strong: {
        label: 'Strong',
        color: 'var(--color-emerald-500)', // Emerald
        icon: ShieldCheck,
    },
    medium: {
        label: 'Medium',
        color: '#f59e0b', // Amber
        icon: ShieldAlert,
    },
    weak: {
        label: 'Weak',
        color: 'var(--color-red-500)', // Red
        icon: ShieldX,
    },
} satisfies ChartConfig;

export function SecurityHealthOverview({ data }: SecurityHealthOverviewProps) {
    const total = data.strong + data.medium + data.weak;

    if (total === 0) {
        return (
            <Card className="border-sidebar-border/70 dark:border-sidebar-border flex flex-col shadow-none">
                <CardHeader className="items-center pb-0">
                    <CardTitle className="text-lg font-semibold">Security Health</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">Password strength distribution</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-6">
                    <div className="text-muted-foreground flex h-[200px] items-center justify-center">
                        <div className="text-center">
                            <div className="mb-2 text-4xl">🔒</div>
                            <div className="text-sm">No passwords found</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const chartData = [
        { level: 'strong', count: data.strong, fill: chartConfig.strong.color },
        { level: 'medium', count: data.medium, fill: chartConfig.medium.color },
        { level: 'weak', count: data.weak, fill: chartConfig.weak.color },
    ].filter((item) => item.count > 0);

    // Calculate the percentage of strong passwords
    const strongPercentage = Math.round((data.strong / total) * 100);

    // Determine the overall security level
    const getSecurityLevel = () => {
        if (strongPercentage >= 80) return { level: 'Excellent', color: 'text-emerald-600', fill: 'fill-emerald-600' };
        if (strongPercentage >= 60) return { level: 'Good', color: 'text-emerald-600', fill: 'fill-emerald-600' };
        if (strongPercentage >= 40) return { level: 'Fair', color: 'text-amber-600', fill: 'fill-amber-600' };
        return { level: 'Poor', color: 'text-red-600', fill: 'fill-red-600' };
    };

    const securityLevel = getSecurityLevel();

    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border flex flex-col gap-y-0 py-2 shadow-none">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-lg font-semibold">Security Health</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">Password strength distribution</CardDescription>
            </CardHeader>
            <CardContent className="mt-4 flex-1">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="level"
                            innerRadius={60}
                            outerRadius={90}
                            strokeWidth={2}
                            stroke="var(--color-background)"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}

                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className={cn('text-3xl font-bold', securityLevel.fill)}>
                                                    {strongPercentage}%
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className={cn('text-xs font-semibold', securityLevel.fill)}
                                                >
                                                    {securityLevel.level}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>

            <CardFooter className="-mt-4 flex-col items-start space-y-2">
                {Object.entries(chartConfig).map(([key, config]) => {
                    const count = data[key as keyof typeof data];
                    const IconComponent = config.icon;
                    return (
                        <div key={key} className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" style={{ color: config.color }} />
                                <span className="text-primary text-sm font-semibold">{config.label}</span>
                            </div>
                            <span className="text-muted-foreground text-sm">{count}</span>
                        </div>
                    );
                })}
            </CardFooter>
        </Card>
    );
}
