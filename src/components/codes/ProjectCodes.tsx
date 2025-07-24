
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
import { addProjectCode } from '@/lib/codes-actions';
  
export function ProjectCodes({ initialProjects }: { initialProjects: ProjectCode[] }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [projects, setProjects] = useState(initialProjects);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const code = formData.get('code') as string;
    const name = formData.get('name') as string;

    if(!code || !name) {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'Code and Name are required.',
      });
      setLoading(false);
      return;
    }

    const { success, message, data: newProject } = await addProjectCode({ code, name });

    if (success && newProject) {
      toast({
        title: '✅ Success!',
        description: message,
      });
      setProjects(p => [newProject, ...p].sort((a, b) => a.name.localeCompare(b.name)));
      formRef.current?.reset();
    } else {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: message,
      });
    }
    setLoading(false);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Codes</CardTitle>
        <CardDescription>
          Add and manage the Jira project codes and names.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Project
            </Button>
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
