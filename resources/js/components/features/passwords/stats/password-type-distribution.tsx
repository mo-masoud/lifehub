import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Cell, Label, Pie, PieChart } from 'recharts';

interface PasswordTypeDistributionProps {
    data: {
        normal: number;
        ssh: number;
    };
}

const chartConfig = {
    normal: {
        label: 'Normal',
        color: 'var(--chart-1)', // Blue
    },
    ssh: {
        label: 'SSH',
        color: 'var(--chart-3)', // Emerald
    },
} satisfies ChartConfig;

export function PasswordTypeDistribution({ data }: PasswordTypeDistributionProps) {
    const chartData = [
        { type: 'normal', count: data.normal, fill: chartConfig.normal.color },
        { type: 'ssh', count: data.ssh, fill: chartConfig.ssh.color },
    ].filter((item) => item.count > 0);

    const total = data.normal + data.ssh;

    if (total === 0) {
        return (
            <Card className="border-sidebar-border/70 dark:border-sidebar-border flex flex-col shadow-none">
                <CardHeader className="items-center pb-0">
                    <CardTitle className="text-lg font-semibold">Password Types</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">Distribution of password types</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                    <div className="text-muted-foreground flex h-[150px] items-center justify-center">
                        <div className="text-center">
                            <div className="mb-2 text-4xl">📊</div>
                            <div className="text-sm">No passwords found</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border flex flex-col gap-y-0 py-2 shadow-none">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-lg font-semibold">Password Types</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">Distribution of password types</CardDescription>
            </CardHeader>

            <CardContent className="mt-4 flex-1">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="count" nameKey="type" innerRadius={50} outerRadius={80} strokeWidth={2} stroke="#ffffff">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}

                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                    {data.ssh + data.normal}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                                    Total
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

            <CardFooter className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: chartConfig.normal.color }} />
                    <span className="text-sm font-medium">Normal ({data.normal})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: chartConfig.ssh.color }} />
                    <span className="text-sm font-medium">SSH ({data.ssh})</span>
                </div>
            </CardFooter>
        </Card>
    );
}
