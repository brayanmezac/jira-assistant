
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
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { projectCodeSchema } from '@/lib/types';
  
export function ProjectCodes({ initialProjects }: { initialProjects: ProjectCode[] }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [projects, setProjects] = useState(initialProjects);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const newProjectData = {
        code: formData.get('code') as string,
        name: formData.get('name') as string,
    };

    console.log("Attempting to add project with data:", newProjectData);

    const validatedFields = projectCodeSchema.safeParse(newProjectData);

    if (!validatedFields.success) {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'Code and Name are required.',
      });
      setLoading(false);
      return;
    }

    try {
        const docRef = await addDoc(collection(db, 'projectCodes'), validatedFields.data);
        const newProject = { id: docRef.id, ...validatedFields.data };
        
        toast({
          title: '✅ Success!',
          description: "Project code added successfully.",
        });
        console.log("Successfully added document with ID:", docRef.id);
        setProjects(p => [newProject, ...p].sort((a, b) => a.name.localeCompare(b.name)));
        formRef.current?.reset();

      } catch (error) {
        console.error('--- DEBUG: Firebase Error while adding project code ---');
        console.error(error);
        console.error('--- END DEBUG ---');
        toast({
            variant: 'destructive',
            title: '❌ Error adding project',
            description: "An error occurred. Check the developer console for details.",
        });
      } finally {
        setLoading(false);
      }
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
