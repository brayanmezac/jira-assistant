
'use client';

import { useEffect, useState } from 'react';
import { TaskCodes } from '@/components/codes/TaskCodes';
import { getTaskCodes } from '@/lib/firebase';
import type { TaskCode } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/use-settings';

function CodesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

const translations = {
    en: {
      title: 'Task Code Configuration',
      description: 'Manage your sub-task codes for Jira ticket generation.',
    },
    es: {
      title: 'Configuración de Códigos de Tarea',
      description: 'Gestiona los códigos de tus subtareas para la generación de tickets de Jira.',
    }
  }

export default function TaskCodesPage() {
  const [tasks, setTasks] = useState<TaskCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;


  useEffect(() => {
    async function loadData() {
      try {
        const taskData = await getTaskCodes();
        taskData.sort((a, b) => a.name.localeCompare(b.name));
        setTasks(taskData);
      } catch (error) {
        console.error("Failed to load task codes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.description}
        </p>
      </header>
      {loading ? <CodesSkeleton /> : <TaskCodes initialTasks={tasks} />}
    </div>
  );
}
