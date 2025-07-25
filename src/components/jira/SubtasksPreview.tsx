
'use client';

import { useEffect, useState } from 'react';
import { getTaskCodes } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Loader2 } from 'lucide-react';
import type { TaskCode } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';

const translations = {
    en: {
        title: 'Subtasks to be Created',
        description: 'The following subtasks will be automatically created under the new story, based on your configuration.',
    },
    es: {
        title: 'Subtareas a Crear',
        description: 'Las siguientes subtareas se crearán automáticamente bajo la nueva historia, según tu configuración.',
    }
}


export function SubtasksPreview() {
  const [tasks, setTasks] = useState<TaskCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const fetchedTasks = await getTaskCodes();
      setTasks(fetchedTasks);
      setLoading(false);
    };
    fetchTasks();
  }, []);


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
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 text-sm">
              <CheckSquare className="h-5 w-5 text-primary/80 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{task.name}</span>
                <span className="text-muted-foreground text-xs">{task.type}</span>
              </div>
            </li>
          ))}
        </ul>
        )}
      </CardContent>
    </Card>
  );
}
