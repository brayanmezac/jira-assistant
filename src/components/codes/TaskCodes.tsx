
'use client';

import { useRef, useState, useMemo } from 'react';
import Image from 'next/image';
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
import { Loader2, Pencil, Trash2, Download, Upload, MoreVertical, Power, PowerOff, Check, ChevronsUpDown, Search, FileText } from 'lucide-react';
import type { TaskCode, ProjectCode } from '@/lib/types';
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
import { useSettings } from '@/hooks/use-settings';
import { getJiraIssueTypes, type JiraApiIssueType } from '@/app/actions';
import { ScrollArea } from '../ui/scroll-area';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useAuth } from '../auth/AuthProvider';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';


const translations = {
    en: {
        allProjects: 'All Projects',
        general: 'General',
        projects: 'Projects',
        searchPlaceholder: 'Search by name, type, or code...',
        filterByProject: 'Filter by project',
        filterByStatus: 'Filter by status',
        all: 'All',
        active: 'Active',
        inactive: 'Inactive',
        importFromJira: 'Import from Jira',
        importFromJson: 'Import from JSON',
        exportToJson: 'Export to JSON',
        importTitle: 'Import Issue Types from Jira',
        importDescription: 'Select issue types to import into your configuration. Already added types are disabled.',
        issueType: 'Issue Type',
        action: 'Action',
        add: 'Add',
        imported: 'Imported',
        cardTitle: 'Task Codes',
        cardDescription: 'Add, import, and manage the subtask codes that will be created.',
        codeLabel: 'Code (Issue Type ID)',
        codePlaceholder: 'e.g., 10001',
        taskTypeLabel: 'Task Type',
        taskTypePlaceholder: 'e.g., Sub-task',
        taskNameLabel: 'Task Name',
        taskNamePlaceholder: 'e.g., Analysis Sub-task',
        addTask: 'Add Task',
        tableName: 'Name',
        tableType: 'Type',
        tableCode: 'Code (ID)',
        tableProjects: 'Projects',
        tableActions: 'Actions',
        editTemplate: 'Edit Template',
        editTask: 'Edit Task',
        deleteTask: 'Delete Task',
        toggleStatus: 'Toggle Status',
        editDialogTitle: 'Edit Task Code',
        editDialogDescription: "Make changes to your task here. Click save when you're done.",
        cancel: 'Cancel',
        saveChanges: 'Save changes',
        deleteDialogTitle: 'Are you absolutely sure?',
        deleteDialogDescription: 'This action cannot be undone. This will permanently delete the task code "{taskName}".',
        deleteConfirm: 'Yes, delete it',
        // Toasts
        importSuccess: 'Issue Type "{issueTypeName}" imported successfully.',
        importError: 'Error importing issue type',
        addSuccess: 'Task code added successfully.',
        addError: 'Error adding task',
        updateSuccess: 'Task code updated successfully.',
        updateError: 'Error updating task',
        deleteSuccess: 'Task code deleted successfully.',
        deleteError: 'Error deleting task',
        exportSuccess: 'Task codes have been exported to JSON.',
        importComplete: 'Import Complete',
        importCompleteDesc: '{count} new task(s) imported successfully.',
        importFailed: 'Import Failed',
        importFailedDesc: 'Invalid JSON format or file content.',
    },
    es: {
        allProjects: 'Todos los Proyectos',
        general: 'General',
        projects: 'Proyectos',
        searchPlaceholder: 'Buscar por nombre, tipo o código...',
        filterByProject: 'Filtrar por proyecto',
        filterByStatus: 'Filtrar por estado',
        all: 'Todos',
        active: 'Activo',
        inactive: 'Inactivo',
        importFromJira: 'Importar desde Jira',
        importFromJson: 'Importar desde JSON',
        exportToJson: 'Exportar a JSON',
        importTitle: 'Importar Tipos de Incidencia desde Jira',
        importDescription: 'Selecciona tipos de incidencia para importar a tu configuración. Los tipos ya agregados están deshabilitados.',
        issueType: 'Tipo de Incidencia',
        action: 'Acción',
        add: 'Añadir',
        imported: 'Importado',
        cardTitle: 'Códigos de Tarea',
        cardDescription: 'Añade, importa y gestiona los códigos de subtarea que se crearán.',
        codeLabel: 'Código (ID de Tipo de Incidencia)',
        codePlaceholder: 'Ej: 10001',
        taskTypeLabel: 'Tipo de Tarea',
        taskTypePlaceholder: 'Ej: Sub-tarea',
        taskNameLabel: 'Nombre de la Tarea',
        taskNamePlaceholder: 'Ej: Sub-tarea de Análisis',
        addTask: 'Añadir Tarea',
        tableName: 'Nombre',
        tableType: 'Tipo',
        tableCode: 'Código (ID)',
        tableProjects: 'Proyectos',
        tableActions: 'Acciones',
        editTemplate: 'Editar Plantilla',
        editTask: 'Editar Tarea',
        deleteTask: 'Eliminar Tarea',
        toggleStatus: 'Activar/Desactivar',
        editDialogTitle: 'Editar Código de Tarea',
        editDialogDescription: 'Haz cambios a tu tarea aquí. Haz clic en guardar cuando termines.',
        cancel: 'Cancelar',
        saveChanges: 'Guardar cambios',
        deleteDialogTitle: '¿Estás completamente seguro?',
        deleteDialogDescription: 'Esta acción no se puede deshacer. Esto eliminará permanentemente el código de tarea "{taskName}".',
        deleteConfirm: 'Sí, eliminarlo',
        // Toasts
        importSuccess: 'Tipo de incidencia "{issueTypeName}" importado con éxito.',
        importError: 'Error al importar el tipo de incidencia',
        addSuccess: 'Código de tarea añadido con éxito.',
        addError: 'Error al añadir la tarea',
        updateSuccess: 'Código de tarea actualizado con éxito.',
        updateError: 'Error al actualizar la tarea',
        deleteSuccess: 'Código de tarea eliminado con éxito.',
        deleteError: 'Error al eliminar la tarea',
        exportSuccess: 'Los códigos de tarea han sido exportados a JSON.',
        importComplete: 'Importación Completa',
        importCompleteDesc: '{count} nueva(s) tarea(s) importada(s) con éxito.',
        importFailed: 'Importación Fallida',
        importFailedDesc: 'Formato JSON o contenido de archivo no válido.',
    }
}

function ImportIssueTypesDialog({
    onTaskAdded,
    existingTasks,
  }: {
    onTaskAdded: (task: TaskCode) => void;
    existingTasks: TaskCode[];
  }) {
    const { settings } = useSettings();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [jiraIssueTypes, setJiraIssueTypes] = useState<JiraApiIssueType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const t = translations[settings.language as keyof typeof translations] || translations.en;
  
    const handleFetchIssueTypes = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getJiraIssueTypes(settings);
      if (result.success && result.issueTypes) {
        setJiraIssueTypes(result.issueTypes);
      } else {
        setError(result.message || 'An unknown error occurred.');
      }
      setIsLoading(false);
    };
  
    const handleAddTask = async (issueType: JiraApiIssueType) => {
      if (!user) return;
      try {
        const newTask = await addTaskCode({
             userId: user.uid,
             name: issueType.name,
             type: issueType.name, // Default type to name
             code: issueType.id,
             iconUrl: issueType.iconUrl,
             status: 'active',
             projectIds: []
            });
        toast({
          title: '✅ Success!',
          description: t.importSuccess.replace('{issueTypeName}', issueType.name),
        });
        onTaskAdded(newTask);
      } catch (e: any) {
        toast({
          variant: 'destructive',
          title: `❌ ${t.importError}`,
          description: e.message || 'An unexpected error occurred.',
        });
      }
    };

    const isImported = (issueTypeName: string) => {
        return existingTasks.some(task => task.name === issueTypeName);
    }
  
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleFetchIssueTypes}>
                <Download className="mr-2" />
                {t.importFromJira}
            </DropdownMenuItem>
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
                          <TableHead>{t.issueType}</TableHead>
                          <TableHead className="text-right">{t.action}</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {jiraIssueTypes.map((it) => (
                          <TableRow key={it.id}>
                              <TableCell className='font-medium flex items-center gap-2'>
                                <Image src={it.iconUrl} alt={it.name} width={16} height={16} unoptimized/>
                                {it.name}
                              </TableCell>
                              <TableCell className='text-right'>
                                  <Button size="sm" onClick={() => handleAddTask(it)} disabled={isImported(it.name)}>
                                    {isImported(it.name) ? t.imported : t.add}
                                </Button>
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

function ProjectsMultiSelect({
    userProjects,
    selectedProjectIds,
    onSelectionChange,
    lang
}: {
    userProjects: ProjectCode[];
    selectedProjectIds: string[];
    onSelectionChange: (ids: string[]) => void;
    lang: 'en' | 'es';
}) {
    const t = translations[lang];
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (projectId: string) => {
        const newSelection = selectedProjectIds.includes(projectId)
            ? selectedProjectIds.filter(id => id !== projectId)
            : [...selectedProjectIds, projectId];
        onSelectionChange(newSelection);
    };

    const selectedProjects = userProjects.filter(p => selectedProjectIds.includes(p.id));

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className="w-full justify-between"
                >
                    <span className='truncate'>
                        {selectedProjectIds.length === 0
                            ? t.general
                            : selectedProjects.map(p => p.name).join(', ')}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={t.projects} />
                    <CommandList>
                        <CommandEmpty>No projects found.</CommandEmpty>
                        <CommandGroup>
                            {userProjects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    onSelect={() => handleSelect(project.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedProjectIds.includes(project.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {project.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export function TaskCodes({ initialTasks, userProjects }: { initialTasks: TaskCode[]; userProjects: ProjectCode[] }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskCode | null>(null);
  const [editingProjectIds, setEditingProjectIds] = useState<string[]>([]);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const searchMatch = searchTerm.length === 0 ||
            task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.code.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch = statusFilter === 'all' || task.status === statusFilter;

        const projectMatch = projectFilter === 'all' ||
            (projectFilter === 'general' && (!task.projectIds || task.projectIds.length === 0)) ||
            (task.projectIds && task.projectIds.includes(projectFilter));

        return searchMatch && statusMatch && projectMatch;
    });
  }, [tasks, searchTerm, statusFilter, projectFilter]);


  const handleTaskAddedFromImport = (newTask: TaskCode) => {
    if (!tasks.some(p => p.id === newTask.id)) {
        setTasks(prev => [...prev, newTask].sort((a,b) => a.name.localeCompare(b.name)));
    }
  }

  const findIconUrlForCode = async (code: string): Promise<string | undefined> => {
    if (!settings.url || !settings.email || !settings.token) {
        toast({
            variant: 'destructive',
            title: 'Jira Settings Missing',
            description: 'Cannot fetch icon without Jira settings configured.'
        });
        return undefined;
    }
    const result = await getJiraIssueTypes(settings);
    if (result.success && result.issueTypes) {
        const foundType = result.issueTypes.find(it => it.id === code);
        return foundType?.iconUrl;
    }
    return undefined;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const newTaskData = {
      userId: user.uid,
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      projectIds: editingProjectIds,
      status: 'active' as 'active' | 'inactive',
      template: '', // Add template field
    };

    const validatedFields = taskCodeSchema.omit({iconUrl: true}).safeParse(newTaskData);
    if (!validatedFields.success) {
      toast({ variant: 'destructive', title: '❌ Error', description: validatedFields.error.errors.map(e => e.message).join(', '), });
      setLoading(false);
      return;
    }

    try {
      const iconUrl = await findIconUrlForCode(validatedFields.data.code);
      const dataToSave = { ...validatedFields.data, iconUrl: iconUrl || '' };
      const newTask = await addTaskCode(dataToSave);
      toast({ title: '✅ Success!', description: t.addSuccess });
      setTasks(p => [newTask, ...p].sort((a, b) => a.name.localeCompare(b.name)));
      formRef.current?.reset();
      setEditingProjectIds([]);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: `❌ ${t.addError}`, description: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTask || !user) return;
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const updatedData = {
      code: formData.get('edit-code') as string,
      name: formData.get('edit-name') as string,
      type: formData.get('edit-type') as string,
      projectIds: editingProjectIds,
      userId: user.uid
    };
    
    const validatedFields = taskCodeSchema.omit({ iconUrl: true, status: true, template: true }).safeParse(updatedData);
    if (!validatedFields.success) {
        toast({ variant: 'destructive', title: '❌ Error', description: validatedFields.error.errors.map(e => e.message).join(', ') });
        setLoading(false);
        return;
    }

    try {
      const iconUrl = await findIconUrlForCode(validatedFields.data.code);
      const dataToUpdate = { ...validatedFields.data, iconUrl: iconUrl || '' };
      await updateTaskCode(editingTask.id, dataToUpdate);
      toast({ title: '✅ Success!', description: t.updateSuccess, });
      setTasks(p => p.map((task) => task.id === editingTask.id ? { ...task, ...dataToUpdate } : task).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingTask(null);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: `❌ ${t.updateError}`, description: 'An error occurred.' });
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTaskCode(taskId);
      toast({ title: '✅ Success!', description: t.deleteSuccess });
      setTasks(p => p.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: `❌ ${t.deleteError}`, description: 'An error occurred.' });
    }
  };
  
  const handleToggleStatus = async (task: TaskCode) => {
    const newStatus = task.status === 'active' ? 'inactive' : 'active';
    try {
        await updateTaskCode(task.id, { status: newStatus });
        setTasks(p => p.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        toast({ title: '✅ Status Updated' });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: `❌ Error updating status`, description: 'An error occurred.' });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(tasks.map(({id, userId, ...rest}) => rest), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'task-codes.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({ title: `✅ ${t.exportSuccess}` });
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        const json = JSON.parse(text as string);
        const tasksToImport = z.array(taskCodeSchema.omit({ userId: true })).parse(json);
        
        let importedCount = 0;
        for (const task of tasksToImport) {
          if (!tasks.some(t => t.name === task.name)) {
            const newTaskData = { ...task, userId: user.uid };
            const newTask = await addTaskCode(newTaskData);
            handleTaskAddedFromImport(newTask);
            importedCount++;
          }
        }
        toast({ title: `✅ ${t.importComplete}`, description: t.importCompleteDesc.replace('{count}', importedCount.toString()), });
      } catch (err) {
        toast({ variant: 'destructive', title: `❌ ${t.importFailed}`, description: t.importFailedDesc });
      }
    };
    reader.readAsText(file);
    if(importFileRef.current) importFileRef.current.value = "";
  }

  const openEditDialog = (task: TaskCode) => {
    setEditingTask(task);
    setEditingProjectIds(task.projectIds || []);
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <ImportIssueTypesDialog onTaskAdded={handleTaskAddedFromImport} existingTasks={tasks} />
                <DropdownMenuItem onClick={() => importFileRef.current?.click()}>
                    <Upload className="mr-2" />
                    {t.importFromJson}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                    <Download className="mr-2" />
                    {t.exportToJson}
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Dialog onOpenChange={(isOpen) => { if (!isOpen) setEditingTask(null)}}>
            <DialogTrigger asChild>
                <Button>{t.addTask}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.addTask}</DialogTitle>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="code">{t.codeLabel}</Label>
                      <Input id="code" name="code" placeholder={t.codePlaceholder} required />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="type">{t.taskTypeLabel}</Label>
                      <Input id="type" name="type" placeholder={t.taskTypePlaceholder} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.taskNameLabel}</Label>
                    <Input id="name" name="name" placeholder={t.taskNamePlaceholder} required />
                  </div>
                   <div className="space-y-2">
                        <Label>{t.projects}</Label>
                        <ProjectsMultiSelect
                            userProjects={userProjects}
                            selectedProjectIds={editingProjectIds}
                            onSelectionChange={setEditingProjectIds}
                            lang={settings.language as 'en' | 'es'}
                        />
                    </div>
                  <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="secondary">{t.cancel}</Button></DialogClose>
                      <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t.addTask}</Button>
                  </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        <div className='space-y-4'>
            <div className='flex gap-2 items-center'>
                <div className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input placeholder={t.searchPlaceholder} className='pl-9' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder={t.filterByProject} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.allProjects}</SelectItem>
                        <SelectItem value="general">{t.general}</SelectItem>
                        {userProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className='w-[120px]'>
                        <SelectValue placeholder={t.filterByStatus} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.all}</SelectItem>
                        <SelectItem value="active">{t.active}</SelectItem>
                        <SelectItem value="inactive">{t.inactive}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="max-h-80 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>{t.tableName}</TableHead>
                    <TableHead>{t.tableType}</TableHead>
                    <TableHead>{t.tableCode}</TableHead>
                    <TableHead>{t.tableProjects}</TableHead>
                    <TableHead className="text-right w-[160px]">{t.tableActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {task.iconUrl && <Image src={task.iconUrl} alt={task.name} width={16} height={16} unoptimized />}
                        {task.name}
                        </TableCell>
                      <TableCell>{task.type}</TableCell>
                      <TableCell className="text-muted-foreground">{task.code}</TableCell>
                       <TableCell>
                        {task.projectIds && task.projectIds.length > 0 ? (
                            <div className='flex flex-wrap gap-1'>
                                {task.projectIds.map(id => {
                                    const project = userProjects.find(p => p.id === id);
                                    return <Badge key={id} variant="secondary">{project?.code || '??'}</Badge>
                                })}
                            </div>
                        ) : (<Badge variant="outline">{t.general}</Badge>)}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => handleToggleStatus(task)} title={t.toggleStatus}>
                            {task.status === 'active' ? <Power className='h-4 w-4 text-green-500'/> : <PowerOff className='h-4 w-4 text-red-500'/>}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title={t.editTemplate}>
                            <Link href={`/codes/tasks/${task.id}/template`}>
                                <FileText className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Dialog
                          open={editingTask?.id === task.id}
                          onOpenChange={(isOpen) => { if (!isOpen) setEditingTask(null); }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(task)} title={t.editTask}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t.editDialogTitle}</DialogTitle>
                              <DialogDescription>{t.editDialogDescription}</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">{t.taskNameLabel}</Label>
                                <Input id="edit-name" name="edit-name" defaultValue={task.name} required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-type">{t.taskTypeLabel}</Label>
                                <Input id="edit-type" name="edit-type" defaultValue={task.type} required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-code">{t.codeLabel}</Label>
                                <Input id="edit-code" name="edit-code" defaultValue={task.code} required />
                              </div>
                               <div className="space-y-2">
                                    <Label>{t.projects}</Label>
                                    <ProjectsMultiSelect
                                        userProjects={userProjects}
                                        selectedProjectIds={editingProjectIds}
                                        onSelectionChange={setEditingProjectIds}
                                        lang={settings.language as 'en' | 'es'}
                                    />
                                </div>
                              <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">{t.cancel}</Button></DialogClose>
                                <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t.saveChanges}</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" title={t.deleteTask}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.deleteDialogTitle}</AlertDialogTitle>
                              <AlertDialogDescription>{t.deleteDialogDescription.replace('{taskName}', task.name)}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(task.id)} className="bg-destructive hover:bg-destructive/90">{t.deleteConfirm}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
