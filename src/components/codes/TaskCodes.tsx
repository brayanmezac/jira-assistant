'use client';

import { useRef, useState } from 'react';
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
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import type { TaskCode } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { taskCodeSchema } from '@/lib/types';

export function TaskCodes({ initialTasks }: { initialTasks: TaskCode[] }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const newTaskData = {
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        type: formData.get('type') as string,
    };
    
    const validatedFields = taskCodeSchema.safeParse(newTaskData);

    if(!validatedFields.success) {
        toast({
          variant: 'destructive',
          title: '❌ Error',
          description: 'All fields are required.',
        });
        setLoading(false);
        return;
      }

    try {
        const docRef = await addDoc(collection(db, 'taskCodes'), validatedFields.data);
        const newTask = { id: docRef.id, ...validatedFields.data };
        
        toast({
          title: '✅ Success!',
          description: "Task code added successfully.",
        });
        setTasks(p => [newTask, ...p].sort((a,b) => a.name.localeCompare(b.name)));
        formRef.current?.reset();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: '❌ Error adding task',
            description: "An error occurred. Check the developer console for details.",
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Codes</CardTitle>
        <CardDescription>
          Add and manage the subtask codes that will be created.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Task
            </Button>
          </CardFooter>
        </form>
        <div className="max-h-60 overflow-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {tasks.map((task) => (
                    <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.code}</TableCell>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.type}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
