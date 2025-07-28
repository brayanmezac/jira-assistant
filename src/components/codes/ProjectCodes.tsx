
'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
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
import { Loader2, Pencil, Trash2, Download, FileText } from 'lucide-react';
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
import { validateJiraProject, getJiraProjects, type JiraApiProject } from '@/app/actions';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '../auth/AuthProvider';

const translations = {
    en: {
      importFromJira: 'Import from Jira',
      importTitle: 'Import Projects from Jira',
      importDescription: 'Select projects to import into your configuration. Already added projects are disabled.',
      projectName: 'Project Name',
      code: 'Code',
      action: 'Action',
      add: 'Add',
      cardTitle: 'Project Codes',
      cardDescription: 'Add, import, and manage the Jira project codes. Each code is validated against Jira.',
      addProject: 'Add Project',
      actions: 'Actions',
      editTemplate: 'Edit Template',
      editProject: 'Edit Project',
      deleteProject: 'Delete Project',
      editDialogTitle: 'Edit Project Code',
      editDialogDescription: 'Make changes to your project here. Click save when you\'re done.',
      cancel: 'Cancel',
      saveChanges: 'Save changes',
      deleteDialogTitle: 'Are you absolutely sure?',
      deleteDialogDescription: 'This action cannot be undone. This will permanently delete the project code "{projectName}".',
      deleteConfirm: 'Yes, delete it',
      // Toasts
      errorRequired: 'Code and Name are required.',
      validationFailed: 'Jira Validation Failed',
      validationFailedDesc: 'Could not validate the project in Jira.',
      addSuccess: 'Project code added successfully after validation.',
      addError: 'Error adding project',
      addErrorDesc: 'An error occurred. Check the developer console for details.',
      updateSuccess: 'Project code updated successfully.',
      updateError: 'Error updating project',
      deleteSuccess: 'Project code deleted successfully.',
      deleteError: 'Error deleting project',
      importSuccess: 'Project "{projectName}" imported successfully.',
      importError: 'Error importing project',
    },
    es: {
      importFromJira: 'Importar desde Jira',
      importTitle: 'Importar Proyectos desde Jira',
      importDescription: 'Selecciona proyectos para importar a tu configuración. Los proyectos ya agregados están deshabilitados.',
      projectName: 'Nombre del Proyecto',
      code: 'Código',
      action: 'Acción',
      add: 'Añadir',
      cardTitle: 'Códigos de Proyecto',
      cardDescription: 'Añade, importa y gestiona los códigos de proyecto de Jira. Cada código se valida contra Jira.',
      addProject: 'Añadir Proyecto',
      actions: 'Acciones',
      editTemplate: 'Editar Plantilla',
      editProject: 'Editar Proyecto',
      deleteProject: 'Eliminar Proyecto',
      editDialogTitle: 'Editar Código de Proyecto',
      editDialogDescription: 'Haz cambios a tu proyecto aquí. Haz clic en guardar cuando termines.',
      cancel: 'Cancelar',
      saveChanges: 'Guardar cambios',
      deleteDialogTitle: '¿Estás completamente seguro?',
      deleteDialogDescription: 'Esta acción no se puede deshacer. Esto eliminará permanentemente el código de proyecto "{projectName}".',
      deleteConfirm: 'Sí, eliminarlo',
      // Toasts
      errorRequired: 'El código y el nombre son obligatorios.',
      validationFailed: 'Falló la validación de Jira',
      validationFailedDesc: 'No se pudo validar el proyecto en Jira.',
      addSuccess: 'Código de proyecto añadido con éxito tras la validación.',
      addError: 'Error al añadir el proyecto',
      addErrorDesc: 'Ocurrió un error. Revisa la consola del desarrollador para más detalles.',
      updateSuccess: 'Código de proyecto actualizado con éxito.',
      updateError: 'Error al actualizar el proyecto',
      deleteSuccess: 'Código de proyecto eliminado con éxito.',
      deleteError: 'Error al eliminar el proyecto',
      importSuccess: 'Proyecto "{projectName}" importado con éxito.',
      importError: 'Error al importar el proyecto',
    }
}

function ImportProjectsDialog({
  onProjectAdded,
}: {
  onProjectAdded: (project: ProjectCode) => void;
}) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [jiraProjects, setJiraProjects] = useState<JiraApiProject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  const handleFetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getJiraProjects(settings);
    if (result.success && result.projects) {
      setJiraProjects(result.projects);
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
    setIsLoading(false);
  };

  const handleAddProject = async (project: JiraApiProject) => {
    if (!user) return;
    try {
      const newProjectData = { 
        name: project.name, 
        code: project.key,
        userId: user.uid,
        template: '',
      };
      const newProject = await addProjectCode(newProjectData);
      toast({
        title: '✅ Success!',
        description: t.importSuccess.replace('{projectName}', project.name),
      });
      onProjectAdded(newProject);
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: `❌ ${t.importError}`,
        description: e.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleFetchProjects}>
          <Download className="mr-2" />
          {t.importFromJira}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.importTitle}</DialogTitle>
          <DialogDescription>
            {t.importDescription}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-destructive bg-destructive/10 p-4 rounded-md">{error}</div>
        ) : (
          <ScrollArea className="h-96">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t.projectName}</TableHead>
                        <TableHead>{t.code}</TableHead>
                        <TableHead className="text-right">{t.action}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jiraProjects.map((p) => (
                        <TableRow key={p.key}>
                            <TableCell className='font-medium'>{p.name}</TableCell>
                            <TableCell>{p.key}</TableCell>
                            <TableCell className='text-right'>
                                <Button size="sm" onClick={() => handleAddProject(p)}>{t.add}</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}


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
  const { user } = useAuth();
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  const handleProjectAddedFromImport = (newProject: ProjectCode) => {
    if (!projects.some(p => p.id === newProject.id)) {
        setProjects(prev => [...prev, newProject].sort((a,b) => a.name.localeCompare(b.name)));
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const newProjectData = {
      userId: user.uid,
      code: formData.get('code') as string,
      name: formData.get('name') as string,
    };

    const validatedFields = projectCodeSchema.omit({template: true}).safeParse(newProjectData);

    if (!validatedFields.success) {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: t.errorRequired,
      });
      setLoading(false);
      return;
    }

    const validationResult = await validateJiraProject({
      projectCode: validatedFields.data.code,
      settings,
    });

    if (!validationResult.success) {
      toast({
        variant: 'destructive',
        title: t.validationFailed,
        description: validationResult.message || t.validationFailedDesc,
      });
      setLoading(false);
      return;
    }

    try {
      const newProject = await addProjectCode(validatedFields.data);

      toast({
        title: '✅ Success!',
        description: t.addSuccess,
      });
      setProjects((p) =>
        [newProject, ...p].sort((a, b) => a.name.localeCompare(b.name))
      );
      formRef.current?.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: `❌ ${t.addError}`,
        description: t.addErrorDesc,
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

     const validationResult = await validateJiraProject({
      projectCode: updatedData.code,
      settings,
    });

    if (!validationResult.success) {
      toast({
        variant: 'destructive',
        title: t.validationFailed,
        description: validationResult.message || t.validationFailedDesc,
      });
      setLoading(false);
      return;
    }

    try {
      await updateProjectCode(editingProject.id, updatedData);
      toast({
        title: '✅ Success!',
        description: t.updateSuccess,
      });
      setProjects((p) =>
        p
          .map((proj) =>
            proj.id === editingProject.id
              ? { ...proj, ...updatedData }
              : proj
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingProject(null);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: `❌ ${t.updateError}`,
        description: t.addErrorDesc,
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
        description: t.deleteSuccess,
      });
      setProjects((p) => p.filter((proj) => proj.id !== projectId));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: `❌ ${t.deleteError}`,
        description: t.addErrorDesc,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{t.cardTitle}</CardTitle>
                <CardDescription className="mt-1">
                {t.cardDescription}
                </CardDescription>
            </div>
            <ImportProjectsDialog onProjectAdded={handleProjectAddedFromImport} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="code">{t.code}</Label>
              <Input id="code" name="code" placeholder="e.g., TPP" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">{t.projectName}</Label>
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
              {t.addProject}
            </Button>
          </CardFooter>
        </form>
        <div className="max-h-60 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead className="w-[100px]">{t.code}</TableHead>
                <TableHead>{t.projectName}</TableHead>
                <TableHead className="text-right w-[150px]">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.code}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                      title={t.editTemplate}
                    >
                      <Link href={`/codes/projects/${project.id}/template`}>
                        <FileText className="h-4 w-4" />
                      </Link>
                    </Button>
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
                          title={t.editProject}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.editDialogTitle}</DialogTitle>
                          <DialogDescription>
                            {t.editDialogDescription}
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={handleEditSubmit}
                          className="space-y-4 py-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="edit-code">{t.code}</Label>
                            <Input
                              id="edit-code"
                              name="edit-code"
                              defaultValue={project.code}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">{t.projectName}</Label>
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
                                {t.cancel}
                              </Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {t.saveChanges}
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
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title={t.deleteProject}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t.deleteDialogTitle}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.deleteDialogDescription.replace('{projectName}', project.name)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(project.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {t.deleteConfirm}
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
