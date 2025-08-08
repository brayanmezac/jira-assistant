
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getGenerationHistory } from '@/lib/firebase';
import type { GenerationHistoryEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/use-settings';
import { HistoryAnalytics } from '@/components/history/HistoryAnalytics';
import { HistoryTable } from '@/components/history/HistoryTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function HistorySkeleton() {
  return (
    <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="pl-2">
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
             <Card className="col-span-3">
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        </div>
        <Skeleton className="h-64 w-full" />
    </div>
  );
}

const translations = {
  en: {
    title: 'Generation History',
    description: 'Review your past Jira ticket generations and analyze your usage.',
  },
  es: {
    title: 'Historial de Generación',
    description: 'Revisa tus generaciones de tickets de Jira pasadas y analiza tu uso.',
  }
};

export default function HistoryPage() {
  const [history, setHistory] = useState<GenerationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  useEffect(() => {
    // Only load history if a user is logged in
    if (!user) {
        setLoading(false);
        return;
    };
    
    async function loadData() {
      try {
        const historyData = await getGenerationHistory(); // Get all history
        setHistory(historyData);
      } catch (error) {
        console.error("Failed to load generation history:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.description}</p>
      </header>
      {loading ? (
        <HistorySkeleton />
      ) : (
        <div className="space-y-8">
            <HistoryAnalytics history={history} />
            <HistoryTable history={history} jiraUrl={settings.url} />
        </div>
      )}
    </div>
  );
}
