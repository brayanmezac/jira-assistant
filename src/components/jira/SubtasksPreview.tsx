import { SUBTASK_LIST } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

export function SubtasksPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subtasks to be Created</CardTitle>
        <CardDescription>
          The following subtasks will be automatically created under the new epic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {SUBTASK_LIST.map((task) => (
            <li key={task.code} className="flex items-center gap-3 text-sm">
              <CheckSquare className="h-5 w-5 text-primary/80 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{task.name}</span>
                <span className="text-muted-foreground text-xs">{task.type}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
