
'use client';

import { useEffect, useState } from 'react';
import { ProjectCodes } from '@/components/codes/ProjectCodes';
import { getProjectCodes } from '@/lib/firebase';
import type { ProjectCode } from '@/lib/types';
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
    title: 'Project Code Configuration',
    description: 'Manage your project codes for Jira ticket generation.',
  },
  es: {
    title: 'Configuración de Códigos de Proyecto',
    description: 'Gestiona los códigos de tus proyectos para la generación de tickets de Jira.',
  }
}

export default function ProjectCodesPage() {
  const [projects, setProjects] = useState<ProjectCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  useEffect(() => {
    async function loadData() {
      try {
        const projectData = await getProjectCodes();
        projectData.sort((a, b) => a.name.localeCompare(b.name));
        setProjects(projectData);
      } catch (error) {
        console.error("Failed to load project codes:", error);
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
      {loading ? <CodesSkeleton /> : <ProjectCodes initialProjects={projects} />}
    </div>
  );
}
