
'use client';

import { useEffect, useState } from 'react';
import { TaskCodes } from '@/components/codes/TaskCodes';
import { getTaskCodesForUser, getProjectCodesForUser } from '@/lib/firebase';
import type { TaskCode, ProjectCode } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/components/auth/AuthProvider';

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
  const [projects, setProjects] = useState<ProjectCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const { user } = useAuth();
  const t = translations[settings.language as keyof typeof translations] || translations.en;


  useEffect(() => {
    if (!user) return;
    async function loadData() {
      try {
        const [userTasks, userProjects] = await Promise.all([
            getTaskCodesForUser(user.uid),
            getProjectCodesForUser(user.uid)
        ]);
        
        userProjects.sort((a, b) => a.name.localeCompare(b.name));

        setTasks(userTasks);
        setProjects(userProjects);

      } catch (error) {
        console.error("Failed to load task and project codes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);
  
  if (!user) {
    return <CodesSkeleton />;
  }

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
      {loading ? <CodesSkeleton /> : <TaskCodes initialTasks={tasks} userProjects={projects} />}
    </div>
  );
}
