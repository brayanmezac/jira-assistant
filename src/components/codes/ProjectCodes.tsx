
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addProjectCodeAction, type CodeFormState } from '@/app/actions';
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
import type { ProjectCode } from '@/lib/types';
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
      Add Project
    </Button>
  );
}

export function ProjectCodes({ initialProjects }: { initialProjects: ProjectCode[] }) {
  const [state, formAction] = useActionState(addProjectCodeAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [projects, setProjects] = useState(initialProjects);

  useEffect(() => {
    setProjects(initialProjects);
  } , [initialProjects]);


  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: '✅ Success!',
          description: state.message,
        });
        // This is optimistic UI update. A more robust solution might refetch.
        const newProject: ProjectCode = {
          id: Date.now().toString(), // temporary id
          code: formRef.current?.code.value,
          name: formRef.current?.name.value,
        }
        setProjects(p => [newProject, ...p]);
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
        <CardTitle>Project Codes</CardTitle>
        <CardDescription>
          Add and manage the Jira project codes and names.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" placeholder="e.g., TPP" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Tablero Proyecto Prueba"
                required
              />
            </div>
          </div>
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton />
          </CardFooter>
        </form>
        <div className="max-h-60 overflow-auto">
        <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead className="w-[100px]">Code</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.code}</TableCell>
                  <TableCell>{project.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
