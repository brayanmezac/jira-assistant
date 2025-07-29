
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { TaskCode } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { renderJiraMarkup } from '@/lib/jira-markup-renderer';

const translations = {
    en: {
        title: 'Subtasks to be Created',
        description: 'The following subtasks will be automatically created. Expand to preview template content.',
    },
    es: {
        title: 'Subtareas a Crear',
        description: 'Las siguientes subtareas se crearán automáticamente. Expande para previsualizar el contenido de la plantilla.',
    }
}

export function SubtasksPreview({ tasks = [] }: { tasks: TaskCode[] }) {
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>
          {t.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex items-center justify-center h-24">
                <Loader2 className="animate-spin text-muted-foreground" />
            </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {tasks.map((task) => (
              task.template ? (
                <AccordionItem value={task.id} key={task.id}>
                  <AccordionTrigger className='text-sm font-medium'>
                    <div className='flex flex-col text-left'>
                      <span>{task.name}</span>
                       <span className="text-muted-foreground text-xs font-normal">{task.type}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div 
                        className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-muted/50 p-3"
                        dangerouslySetInnerHTML={{ __html: renderJiraMarkup(task.template) }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ) : (
                 <div key={task.id} className="flex items-center border-b py-4 text-sm font-medium">
                    <div className='flex flex-col text-left'>
                        <span>{task.name}</span>
                        <span className="text-muted-foreground text-xs font-normal">{task.type}</span>
                    </div>
                 </div>
              )
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
