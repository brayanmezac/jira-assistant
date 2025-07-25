
'use client';

import { JiraGenerator } from '@/components/jira/JiraGenerator';
import { useSettings } from '@/hooks/use-settings';

const translations = {
  en: {
    title: 'Jira Assist',
    description: 'Generate Jira epics, stories, and subtasks automatically using AI.',
  },
  es: {
    title: 'Asistente de Jira',
    description: 'Genera epics, historias y subtareas de Jira automáticamente usando IA.',
  }
}

export default function Home() {
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;

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
      <JiraGenerator />
    </div>
  );
}
