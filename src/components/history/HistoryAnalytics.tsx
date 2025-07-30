
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import type { GenerationHistoryEntry } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';

const translations = {
    en: {
        modelUsage: 'AI Model Usage',
        modelUsageDescription: 'Distribution of AI models used in ticket generation.',
        noAi: 'No AI',
        totalGenerations: 'Total Generations',
    },
    es: {
        modelUsage: 'Uso de Modelos de IA',
        modelUsageDescription: 'Distribución de modelos de IA usados en la generación de tickets.',
        noAi: 'Sin IA',
        totalGeneraciones: 'Generaciones Totales',
    }
}

const COLORS = {
    OpenAI: 'hsl(var(--chart-1))',
    Gemini: 'hsl(var(--chart-2))',
    'No AI': 'hsl(var(--chart-3))',
};

export function HistoryAnalytics({ history }: { history: GenerationHistoryEntry[] }) {
    const { settings } = useSettings();
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    const modelUsageData = useMemo(() => {
        const counts = history.reduce((acc, entry) => {
            const model = entry.aiModel || t.noAi;
            acc[model] = (acc[model] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value, fill: COLORS[name as keyof typeof COLORS] || COLORS['No AI'] }));
    }, [history, t.noAi]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                 <CardHeader>
                    <CardTitle>Usage Over Time (Coming Soon)</CardTitle>
                     <CardDescription>
                        A chart showing your generation costs over time will be available here.
                    </CardDescription>
                </CardHeader>
                <CardContent className='h-[350px] flex items-center justify-center text-muted-foreground'>
                   <p>Analytics chart will be displayed here in a future update.</p>
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
