
'use client';

import { useEffect, useState } from 'react';
import { TaskCodes } from '@/components/codes/TaskCodes';
import { getTaskCodes } from '@/lib/firebase';
import type { TaskCode } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function CodesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function TaskCodesPage() {
  const [tasks, setTasks] = useState<TaskCode[]>([]);
  const [loading, setLoading] = useState(true);

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
          Task Code Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your sub-task codes for Jira ticket generation.
        </p>
      </header>
      {loading ? <CodesSkeleton /> : <TaskCodes initialTasks={tasks} />}
    </div>
  );
}
