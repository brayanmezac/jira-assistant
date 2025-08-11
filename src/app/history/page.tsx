
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getGenerationHistory, db } from '@/lib/firebase';
import type { GenerationHistoryEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/use-settings';
import { HistoryAnalytics } from '@/components/history/HistoryAnalytics';
import { HistoryTable } from '@/components/history/HistoryTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, where, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';

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
    if (!user) {
        setLoading(false);
        setHistory([]);
        return;
    };
    
    setLoading(true);

    const historyRef = collection(db, 'generationHistory');
    const q = query(historyRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const historyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GenerationHistoryEntry));
        setHistory(historyData);
        setLoading(false);
    }, (error) => {
        console.error("Failed to subscribe to generation history:", error);
        setLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
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
