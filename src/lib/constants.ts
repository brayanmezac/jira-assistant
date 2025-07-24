'use client';

import { useEffect, useState } from 'react';
import { getSubtasks } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Loader2 } from 'lucide-react';
import type { TaskCode } from '@/lib/types';


export function SubtasksPreview() {
  const [tasks, setTasks] = useState<TaskCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const fetchedTasks = await getSubtasks();
      setTasks(fetchedTasks);
      setLoading(false);
    };
    fetchTasks();
  }, []);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Subtasks to be Created</CardTitle>
        <CardDescription>
          The following subtasks will be automatically created under the new story, based on your configuration.
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
  </change>
  <change>
    <file>/src/lib/constants.ts</file>
    <content><