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
import type { ProjectCode } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { addProjectCode, deleteProjectCode, updateProjectCode } from '@/lib/firebase';
import { projectCodeSchema } from '@/lib/types';
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
import { useSettings } from '@/hooks/use-settings';
import { validateJiraProject } from '@/app/actions';

export function ProjectCodes({
  initialProjects,
}: {
  initialProjects: ProjectCode[];
}) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [projects, setProjects] = useState(initialProjects);
  const [loading, setLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectCode | null>(
    null
  );
  const { settings } = useSettings();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const newProjectData = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
    };

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

    // --- JIRA VALIDATION ---
    const validationResult = await validateJiraProject({
      projectCode: validatedFields.data.code,
      settings,
    });

    if (!validationResult.success) {
      toast({
        variant: 'destructive',
        title: 'Jira Validation Failed',
        description: validationResult.message || 'Could not validate the project in Jira.',
      });
      setLoading(false);
      return;
    }
    // --- END JIRA VALIDATION ---

    try {
      const newProject = await addProjectCode(validatedFields.data);

      toast({
        title: '✅ Success!',
        description: 'Project code added successfully after validation.',
      });
      setProjects((p) =>
        [newProject, ...p].sort((a, b) => a.name.localeCompare(b.name))
      );
      formRef.current?.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: '❌ Error adding project',
        description: 'An error occurred. Check the developer console for details.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProject) return;
    
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const updatedData = {
      code: formData.get('edit-code') as string,
      name: formData.get('edit-name') as string,
    };

    const validatedFields = projectCodeSchema.safeParse(updatedData);

    if (!validatedFields.success) {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'Code and Name are required.',
      });
      setLoading(false);
      return;
    }

    // --- JIRA VALIDATION ON EDIT ---
     const validationResult = await validateJiraProject({
      projectCode: validatedFields.data.code,
      settings,
    });

    if (!validationResult.success) {
      toast({
        variant: 'destructive',
        title: 'Jira Validation Failed',
        description: validationResult.message || 'Could not validate the project in Jira.',
      });
      setLoading(false);
      return;
    }
    // --- END JIRA VALIDATION ---

    try {
      await updateProjectCode(editingProject.id, validatedFields.data);
      toast({
        title: '✅ Success!',
        description: 'Project code updated successfully.',
      });
      setProjects((p) =>
        p
          .map((proj) =>
            proj.id === editingProject.id
              ? { ...proj, ...validatedFields.data }
              : proj
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingProject(null); // This will close the dialog via the `open` prop
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: '❌ Error updating project',
        description: 'An error occurred. Check the developer console for details.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      await deleteProjectCode(projectId);
      toast({
        title: '✅ Success!',
        description: 'Project code deleted successfully.',
      });
      setProjects((p) => p.filter((proj) => proj.id !== projectId));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: '❌ Error deleting project',
        description: 'An error occurred. Check the developer console for details.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Codes</CardTitle>
        <CardDescription>
          Add, edit, and manage the Jira project codes. Each code is validated against Jira before being saved.
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
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.code}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Dialog
                      open={editingProject?.id === project.id}
                      onOpenChange={(isOpen) => {
                        if (!isOpen) setEditingProject(null);
                        else setEditingProject(project);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingProject(project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Project Code</DialogTitle>
                          <DialogDescription>
                            Make changes to your project here. Click save when
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
                              defaultValue={project.code}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Project Name</Label>
                            <Input
                              id="edit-name"
                              name="edit-name"
                              defaultValue={project.name}
                              required
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save changes
                            </Button>
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
                            delete the project code "{project.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(project.id)}
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
