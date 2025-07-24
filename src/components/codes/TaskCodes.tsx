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
} from '@/components/ui/table';
import { addTaskCode, deleteTaskCode, updateTaskCode } from '@/lib/firebase';
import { taskCodeSchema } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

export function TaskCodes({ initialTasks }: { initialTasks: TaskCode[] }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskCode | null>(null);

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

    if (!validatedFields.success) {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'All fields are required.',
      });
      setLoading(false);
      return;
    }

    try {
      const newTask = await addTaskCode(validatedFields.data);

      toast({
        title: '✅ Success!',
        description: 'Task code added successfully.',
      });
      setTasks((p) =>
        [newTask, ...p].sort((a, b) => a.name.localeCompare(b.name))
      );
      formRef.current?.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: '❌ Error adding task',
        description: 'An error occurred. Check the developer console for details.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTask) return;

    const formData = new FormData(event.currentTarget);
    const updatedData = {
      code: formData.get('edit-code') as string,
      name: formData.get('edit-name') as string,
      type: formData.get('edit-type') as string,
    };

    const validatedFields = taskCodeSchema.safeParse(updatedData);

    if (!validatedFields.success) {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'All fields are required.',
      });
      return;
    }

    try {
      await updateTaskCode(editingTask.id, validatedFields.data);
      toast({
        title: '✅ Success!',
        description: 'Task code updated successfully.',
      });
      setTasks((p) =>
        p
          .map((task) =>
            task.id === editingTask.id
              ? { ...task, ...validatedFields.data }
              : task
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingTask(null);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: '❌ Error updating task',
        description: 'An error occurred. Check the developer console for details.',
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTaskCode(taskId);
      toast({
        title: '✅ Success!',
        description: 'Task code deleted successfully.',
      });
      setTasks((p) => p.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: '❌ Error deleting task',
        description: 'An error occurred. Check the developer console for details.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Codes</CardTitle>
        <CardDescription>
          Add, edit, and manage the subtask codes that will be created.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g., TDEV_01"
                required
              />
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
            <Input
              id="type"
              name="type"
              placeholder="e.g., Desarrollo"
              required
            />
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
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.code}</TableCell>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.type}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Dialog
                      open={editingTask?.id === task.id}
                      onOpenChange={(isOpen) => {
                        if (!isOpen) setEditingTask(null);
                        else setEditingTask(task);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingTask(task)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Task Code</DialogTitle>
                          <DialogDescription>
                            Make changes to your task here. Click save when
                            you're done.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={handleEditSubmit}
                          className="space-y-4 py-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="edit-code">Code</Label>
                            <Input
                              id="edit-code"
                              name="edit-code"
                              defaultValue={task.code}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Task Name</Label>
                            <Input
                              id="edit-name"
                              name="edit-name"
                              defaultValue={task.name}
                              required
                            />
                          </div>
                           <div className="space-y-2">
                            <Label htmlFor="edit-type">Task Type</Label>
                            <Input
                              id="edit-type"
                              name="edit-type"
                              defaultValue={task.type}
                              required
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button type="submit">Save changes</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the task code "{task.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(task.id)}
                             className="bg-destructive hover:bg-destructive/90"
                          >
                            Yes, delete it
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
