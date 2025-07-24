
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addTaskCodeAction, type CodeFormState } from '@/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { TaskCode } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

const initialState: CodeFormState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Add Task
    </Button>
  );
}

export function TaskCodes({ initialTasks }: { initialTasks: TaskCode[] }) {
  const [state, formAction] = useActionState(addTaskCodeAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: '✅ Success!',
          description: state.message,
        });
        const newTask: TaskCode = {
            id: Date.now().toString(),
            code: formRef.current?.code.value,
            name: formRef.current?.name.value,
            type: formRef.current?.type.value,
        }
        setTasks(p => [newTask, ...p]);
        formRef.current?.reset();
      } else {
        toast({
          variant: 'destructive',
          title: '❌ Error',
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Codes</CardTitle>
        <CardDescription>
          Add and manage the subtask codes that will be created.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" placeholder="e.g., TDEV_01" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Task Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Tarea de Desarrollo"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Task Type</Label>
            <Input id="type" name="type" placeholder="e.g., Desarrollo" required />
          </div>
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton />
          </CardFooter>
        </form>
        <div className="max-h-60 overflow-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {tasks.map((task) => (
                    <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.code}</TableCell>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.type}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
