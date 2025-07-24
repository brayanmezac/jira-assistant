
'use client';

import { useEffect, useState } from 'react';
import { ProjectCodes } from '@/components/codes/ProjectCodes';
import { TaskCodes } from '@/components/codes/TaskCodes';
import { getProjectCodes, getTaskCodes } from '@/lib/firebase';
import type { ProjectCode, TaskCode } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function CodesSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}


export default function CodesPage() {
  const [projects, setProjects] = useState<ProjectCode[]>([]);
  const [tasks, setTasks] = useState<TaskCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectData, taskData] = await Promise.all([
          getProjectCodes(),
          getTaskCodes(),
        ]);
        
        projectData.sort((a, b) => a.name.localeCompare(b.name));
        taskData.sort((a, b) => a.name.localeCompare(b.name));

        setProjects(projectData);
        setTasks(taskData);
      } catch (error) {
        console.error("Failed to load codes:", error);
        // Optionally, show a toast notification for the error
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
          Code Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your project and task codes for Jira ticket generation.
        </p>
      </header>
      {loading ? (
        <CodesSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProjectCodes initialProjects={projects}/>
          <TaskCodes initialTasks={tasks} />
        </div>
      )}
    </div>
  );
}
