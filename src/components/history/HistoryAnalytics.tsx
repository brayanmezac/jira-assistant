
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Cell, XAxis, YAxis } from 'recharts';
import type { GenerationHistoryEntry } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';
import { format, parseISO } from 'date-fns';

const translations = {
    en: {
        modelUsage: 'AI Model Usage',
        modelUsageDescription: 'Distribution of AI models used in ticket generation.',
        noAi: 'No AI',
        totalGenerations: 'Total Generations',
        usageOverTime: 'Usage Over Time',
        usageOverTimeDescription: 'A chart showing your estimated AI costs over time.',
        cost: 'Cost',
    },
    es: {
        modelUsage: 'Uso de Modelos de IA',
        modelUsageDescription: 'Distribución de modelos de IA usados en la generación de tickets.',
        noAi: 'Sin IA',
        totalGeneraciones: 'Generaciones Totales',
        usageOverTime: 'Uso a lo largo del tiempo',
        usageOverTimeDescription: 'Un gráfico que muestra tus costos de IA estimados a lo largo del tiempo.',
        cost: 'Costo',
    }
}

const COLORS = {
    OpenAI: 'hsl(var(--chart-1))',
    Gemini: 'hsl(var(--chart-2))',
    'No AI': 'hsl(var(--chart-3))',
};

const chartConfig: ChartConfig = {
  cost: {
    label: "Cost",
    color: "hsl(var(--chart-1))",
  },
};

export function HistoryAnalytics({ history }: { history: GenerationHistoryEntry[] }) {
    const { settings } = useSettings();
    const t = translations[settings.language as keyof typeof translations] || translations.en;
    
    chartConfig.cost.label = t.cost;

    const modelUsageData = useMemo(() => {
        const counts = history.reduce((acc, entry) => {
            const model = entry.aiModel || t.noAi;
            acc[model] = (acc[model] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value, fill: COLORS[name as keyof typeof COLORS] || COLORS['No AI'] }));
    }, [history, t.noAi]);

    const usageOverTimeData = useMemo(() => {
        const dailyCosts = history.reduce((acc, entry) => {
            if (entry.aiUsed && entry.createdAt) {
                const date = format(new Date(entry.createdAt.seconds * 1000), 'yyyy-MM-dd');
                acc[date] = (acc[date] || 0) + (entry.aiCost || 0);
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(dailyCosts)
            .map(([date, cost]) => ({
                date: format(parseISO(date), 'MMM d'), // Format for display
                cost: parseFloat(cost.toFixed(6)), // Round to avoid floating point issues
            }))
            .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    }, [history]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                 <CardHeader>
                    <CardTitle>{t.usageOverTime}</CardTitle>
                     <CardDescription>
                        {t.usageOverTimeDescription}
                    </CardDescription>
                </CardHeader>
                <CardContent className='h-[350px] pl-2'>
                    <ChartContainer config={chartConfig}>
                        <BarChart
                            accessibilityLayer
                            data={usageOverTimeData}
                            margin={{
                                top: 20,
                                right: 20,
                                bottom: 20,
                                left: 20,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                             <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tickFormatter={(value) => `$${value.toFixed(4)}`}
                             />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent 
                                    formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`}
                                />}
                            />
                            <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>{t.modelUsage}</CardTitle>
                    <CardDescription>{t.modelUsageDescription}</CardDescription>
                </CardHeader>
                <CardContent className='h-[350px]'>
                    <ChartContainer
                        config={{
                            value: { label: t.totalGenerations },
                            ...modelUsageData.reduce((acc, cur) => ({...acc, [cur.name]: {label: cur.name}}), {})
                        }}
                    >
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="value" />} />
                            <Pie
                                data={modelUsageData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                {modelUsageData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                             <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
