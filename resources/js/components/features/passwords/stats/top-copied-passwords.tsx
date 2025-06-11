import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';

interface TopCopiedPasswordsProps {
    data: Array<{
        id: number;
        name: string;
        copied: number;
        type: string;
    }>;
    totalCopied: number;
}

function truncateText(text: string, maxLength: number = 8): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength);
}

export function TopCopiedPasswords({ data, totalCopied }: TopCopiedPasswordsProps) {
    let chartConfig: ChartConfig = {};

    data.forEach((item, index) => {
        chartConfig[item.name] = {
            label: item.name,
            color: `var(--chart-${index + 1})`,
        };
    });

    const chartData = data.map((item, index) => ({
        name: truncateText(item.name),
        originalName: item.name,
        copied: item.copied,
        fill: `var(--chart-${index + 1})`,
    }));

    if (data.length === 0) {
        return (
            <Card className="border-sidebar-border/70 dark:border-sidebar-border flex flex-col py-2 shadow-none">
                <CardHeader className="items-center">
                    <CardTitle className="text-lg font-semibold">Most Copied Passwords</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">Top 5 passwords by copy count</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-muted-foreground flex h-[150px] items-center justify-center">
                        <div className="text-center">
                            <div className="mb-2 text-4xl">📋</div>
                            <div className="text-sm">No copied passwords found</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border flex flex-col gap-y-0 py-2 shadow-none">
            <CardHeader className="items-center">
                <CardTitle className="text-lg font-semibold">Most Copied Passwords</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">Top 5 passwords by copy count</CardDescription>
            </CardHeader>
            <CardContent className="mt-4 flex-1">
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            left: 80,
                            right: 60,
                        }}
                    >
                        <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={50} hide />
                        <XAxis dataKey="copied" type="number" hide />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="copied" layout="vertical" radius={8}>
                            <LabelList
                                dataKey="name"
                                position="left"
                                offset={8}
                                className="fill-primary text-xs font-medium capitalize"
                                fontSize={12}
                                textAnchor="end"
                            />
                            <LabelList
                                dataKey="copied"
                                position="right"
                                offset={8}
                                className="fill-muted-foreground text-xs font-medium"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
                <h4 className="text-primary text-sm font-semibold">Total copied</h4>
                <span className="text-muted-foreground text-sm">{totalCopied.toLocaleString()}</span>
            </CardFooter>
        </Card>
    );
}
