
'use client';

import { useFormContext, Controller } from 'react-hook-form';
import type { z } from 'zod';
import { jiraStoryFormSchema, type ProjectCode, type TaskCode } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { getProjectCodes, getTaskCodes } from '@/lib/firebase';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SubmitButton } from '../SubmitButton';
import { PencilLine, ChevronsUpDown, Check } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '../auth/AuthProvider';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Command, CommandInput, CommandEmpty, CommandList, CommandGroup, CommandItem } from '../ui/command';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

type GeneratorFormProps = {
  formAction: (payload: FormData) => void;
};

const translations = {
    en: {
        cardTitle: 'Create New Story',
        cardDescription: 'Fill in the details below to generate a new Jira story and subtasks.',
        projectLabel: 'Project',
        projectPlaceholder: 'Select a project',
        storyNameLabel: 'Story Name',
        storyNamePlaceholder: 'e.g., Implement user authentication',
        tasksLabel: 'Tasks',
        tasksPlaceholder: 'Select tasks to include',
        storyNumberLabel: 'Story Number',
        storyNumberPlaceholder: 'e.g., 123',
        aiContextLabel: 'AI Context',
        aiContextPlaceholder: 'Provide all relevant meeting notes, technical details, or user requirements. This context will be used by the AI tag in your template.',
        aiContextDescription: "This context will be injected into your project's template where you've placed an <AI /> tag.",
        submitButton: 'Prepare for Jira',
        submittingButton: 'Preparing...',
        searchTasks: 'Search tasks...',
        noTasksFound: 'No tasks found.',
    },
    es: {
        cardTitle: 'Crear Nueva Historia',
        cardDescription: 'Completa los detalles a continuación para generar una nueva historia y subtareas de Jira.',
        projectLabel: 'Proyecto',
        projectPlaceholder: 'Selecciona un proyecto',
        storyNameLabel: 'Nombre de la Historia',
        storyNamePlaceholder: 'Ej: Implementar autenticación de usuarios',
        tasksLabel: 'Tareas',
        tasksPlaceholder: 'Selecciona tareas a incluir',
        storyNumberLabel: 'Número de Historia',
        storyNumberPlaceholder: 'Ej: 123',
        aiContextLabel: 'Contexto para la IA',
        aiContextPlaceholder: 'Proporciona todas las notas de reunión, detalles técnicos o requisitos de usuario relevantes. Este contexto será utilizado por la etiqueta AI en tu plantilla.',
        aiContextDescription: 'Este contexto se inyectará en la plantilla de tu proyecto donde hayas colocado una etiqueta <AI />.',
        submitButton: 'Preparar para Jira',
        submittingButton: 'Preparando...',
        searchTasks: 'Buscar tareas...',
        noTasksFound: 'No se encontraron tareas.',
    }
}

function TasksMultiSelect({
    availableTasks,
    selectedTaskIds,
    onSelectionChange,
    lang = 'en',
}: {
    availableTasks: TaskCode[];
    selectedTaskIds: string[];
    onSelectionChange: (ids: string[]) => void;
    lang?: 'en' | 'es';
}) {
    const t = translations[lang] || translations.en;
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (taskId: string) => {
        const newSelection = selectedTaskIds.includes(taskId)
            ? selectedTaskIds.filter(id => id !== taskId)
            : [...selectedTaskIds, taskId];
        onSelectionChange(newSelection);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className="w-full justify-between"
                >
                    <span className='truncate'>{t.tasksPlaceholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={t.searchTasks} />
                    <CommandList>
                        <CommandEmpty>{t.noTasksFound}</CommandEmpty>
                        <CommandGroup>
                            {availableTasks.map((task) => (
                                <CommandItem
                                    key={task.id}
                                    onSelect={() => {
                                        handleSelect(task.id)
                                    }}
                                    className="flex items-center"
                                >
                                    <Checkbox
                                        id={`task-${task.id}`}
                                        checked={selectedTaskIds.includes(task.id)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`task-${task.id}`} className="flex-1">{task.name}</label>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export function GeneratorForm({ formAction }: GeneratorFormProps) {
  const [projects, setProjects] = useState<ProjectCode[]>([]);
  const [allTasks, setAllTasks] = useState<TaskCode[]>([]);
  const { settings } = useSettings();
  const { user } = useAuth();
  const t = translations[settings.language as 'en' | 'es'] || translations.en;
  const [isAiContextFocused, setIsAiContextFocused] = useState(false);
    
  const form = useFormContext<z.infer<typeof jiraStoryFormSchema>>();
  const { control, watch, setValue } = form;
  const selectedProject = watch('project');
  const selectedTaskIds = watch('selectedTasks') || [];

  const availableTasks = useMemo(() => {
      if (!selectedProject || !projects.length) return [];
      const projectInfo = projects.find(p => p.name === selectedProject);
      if (!projectInfo) return [];

      return allTasks.filter(task => {
            const isRelevantForProject = !task.projectIds || task.projectIds.length === 0 || task.projectIds.includes(projectInfo.id);
            const isActiveOrOptional = task.status === 'active' || task.status === 'optional';
            return isRelevantForProject && isActiveOrOptional;
      });
  }, [selectedProject, allTasks, projects]);

  useEffect(() => {
    const activeTaskIds = availableTasks.filter(t => t.status === 'active').map(t => t.id);
    const optionalSelectedTaskIds = availableTasks
        .filter(t => t.status === 'optional' && selectedTaskIds.includes(t.id))
        .map(t => t.id);

    const newSelectedTasks = [...new Set([...activeTaskIds, ...optionalSelectedTaskIds])];

    if (JSON.stringify(newSelectedTasks.sort()) !== JSON.stringify(selectedTaskIds.sort())) {
        setValue('selectedTasks', newSelectedTasks, { shouldValidate: true, shouldDirty: true });
    }
}, [availableTasks, selectedTaskIds, setValue]);


  const tasksToDisplay = useMemo(() => {
    if (!selectedProject) return [];
    
    return allTasks
        .filter(task => {
            const projectInfo = projects.find(p => p.name === selectedProject);
            if (!projectInfo) return false;

            const isRelevant = !task.projectIds || task.projectIds.length === 0 || task.projectIds.includes(projectInfo.id);
            if (!isRelevant) return false;

            return task.status === 'active' || task.status === 'optional';
        })
        .map(task => ({
            id: task.id,
            type: task.type,
            display: selectedTaskIds.includes(task.id) ? 'normal' : 'strike',
        }));

  }, [allTasks, selectedProject, selectedTaskIds, projects]);

 useEffect(() => {
      if (!user) return;
      const fetchProjectsAndTasks = async () => {
          const [projectList, taskList] = await Promise.all([
              getProjectCodes(user.uid),
              getTaskCodes(user.uid)
          ]);
          projectList.sort((a,b) => a.name.localeCompare(b.name));
          // tasks are already sorted by order from firebase
          setProjects(projectList);
          setAllTasks(taskList);
      };
      fetchProjectsAndTasks();
  }, [user]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <input type="hidden" {...form.register('userId')} />
        {selectedTaskIds.map(id => <input key={id} type="hidden" name="selectedTasks" value={id} />)}
        
        <Card>
          <CardHeader>
            <CardTitle>{t.cardTitle}</CardTitle>
            <CardDescription>{t.cardDescription}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-3 gap-6">
                <FormField
                control={control}
                name="project"
                render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                    <FormLabel>{t.projectLabel}</FormLabel>
                    <Select
                        onValueChange={(value) => {
                            field.onChange(value);
                        }}
                        defaultValue={field.value}
                        name={field.name}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={t.projectPlaceholder} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {projects.map(project => (
                            <SelectItem key={project.id} value={project.name}>
                                {project.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={control}
                    name="number"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.storyNumberLabel}</FormLabel>
                        <FormControl>
                        <Input 
                            type="number" 
                            placeholder={t.storyNumberPlaceholder} 
                            {...field} 
                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            value={field.value ?? ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
             <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.storyNameLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.storyNamePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className='grid md:grid-cols-3 gap-6'>
                <FormField
                    control={control}
                    name="selectedTasks"
                    render={({ field }) => (
                        <FormItem className="md:col-span-1">
                            <FormLabel>{t.tasksLabel}</FormLabel>
                            <TasksMultiSelect 
                                availableTasks={availableTasks}
                                selectedTaskIds={field.value || []}
                                onSelectionChange={(ids) => field.onChange(ids)}
                                lang={settings.language as 'en' | 'es' || 'en'}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className='md:col-span-2 flex items-end'>
                    <div className='flex flex-wrap gap-2 p-2 border rounded-md w-full min-h-[40px]'>
                         {tasksToDisplay.map((task) => (
                            <Badge key={task.id} variant="secondary" className={cn(task.display === 'strike' && 'line-through text-muted-foreground')}>
                                {task.type}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>


            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.aiContextLabel}</FormLabel>
                   <div className={cn("animated-border-wrapper", isAiContextFocused && "focused")}>
                    <FormControl>
                        <Textarea
                            placeholder={t.aiContextPlaceholder}
                            className="min-h-40 textarea"
                            {...field}
                            onFocus={() => setIsAiContextFocused(true)}
                            onBlur={() => setIsAiContextFocused(false)}
                        />
                    </FormControl>
                  </div>
                  <FormDescription>
                    {t.aiContextDescription}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <SubmitButton loadingText={t.submittingButton}>
                <PencilLine className="mr-2"/>
                {t.submitButton}
            </SubmitButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
