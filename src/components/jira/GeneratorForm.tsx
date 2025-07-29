
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { jiraStoryFormSchema, type ProjectCode } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getProjectCodes } from '@/lib/firebase';

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
import { Bot, PencilLine } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '../auth/AuthProvider';

type GeneratorFormProps = {
  formAction: (payload: FormData) => void;
  initialState: any;
};

const translations = {
    en: {
        cardTitle: 'Create New Story',
        cardDescription: 'Fill in the details below to generate a new Jira story and subtasks.',
        projectLabel: 'Project',
        projectPlaceholder: 'Select a project',
        storyNameLabel: 'Story Name',
        storyNamePlaceholder: 'e.g., Implement user authentication',
        storyNumberLabel: 'Story Number',
        storyNumberPlaceholder: 'e.g., 123',
        aiContextLabel: 'AI Context',
        aiContextPlaceholder: 'Provide all relevant meeting notes, technical details, or user requirements. This context will be used by the AI tag in your template.',
        aiContextDescription: "This context will be injected into your project's template where you've placed an <AI /> tag.",
        modelLabel: 'AI Model',
        modelPlaceholder: 'Select an AI model',
        modelDescription: 'Choose the generative model to use for content creation.',
        submitButton: 'Prepare for Jira',
        submittingButton: 'Preparing...',
    },
    es: {
        cardTitle: 'Crear Nueva Historia',
        cardDescription: 'Completa los detalles a continuación para generar una nueva historia y subtareas de Jira.',
        projectLabel: 'Proyecto',
        projectPlaceholder: 'Selecciona un proyecto',
        storyNameLabel: 'Nombre de la Historia',
        storyNamePlaceholder: 'Ej: Implementar autenticación de usuarios',
        storyNumberLabel: 'Número de Historia',
        storyNumberPlaceholder: 'Ej: 123',
        aiContextLabel: 'Contexto para la IA',
        aiContextPlaceholder: 'Proporciona todas las notas de reunión, detalles técnicos o requisitos de usuario relevantes. Este contexto será utilizado por la etiqueta AI en tu plantilla.',
        aiContextDescription: 'Este contexto se inyectará en la plantilla de tu proyecto donde hayas colocado una etiqueta <AI />.',
        modelLabel: 'Modelo de IA',
        modelPlaceholder: 'Selecciona un modelo de IA',
        modelDescription: 'Elige el modelo generativo a utilizar para la creación de contenido.',
        submitButton: 'Preparar para Jira',
        submittingButton: 'Preparando...',
    }
}


export function GeneratorForm({ formAction, initialState }: GeneratorFormProps) {
    const [projects, setProjects] = useState<ProjectCode[]>([]);
    const { settings } = useSettings();
    const { user } = useAuth();
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    useEffect(() => {
        if (!user) return;
        const fetchProjects = async () => {
            const projectList = await getProjectCodes(user.uid);
            setProjects(projectList);
        };
        fetchProjects();
    }, [user]);

  const form = useForm<z.infer<typeof jiraStoryFormSchema>>({
    resolver: zodResolver(jiraStoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      number: undefined,
      project: '',
      userId: user?.uid || '',
      model: 'googleai/gemini-1.5-flash-latest',
    },
    context: initialState,
  });

  // Sync userId to form if it changes
  useEffect(() => {
    if (user) {
        form.setValue('userId', user.uid);
    }
  }, [user, form]);

  return (
    <Form {...form}>
      <form action={formAction}>
        <input type="hidden" {...form.register('userId')} />
        <input type="hidden" value="googleai/gemini-1.5-flash-latest" {...form.register('model')} />
        <Card>
          <CardHeader>
            <CardTitle>{t.cardTitle}</CardTitle>
            <CardDescription>{t.cardDescription}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.projectLabel}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
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
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
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
              <FormField
                control={form.control}
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
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.aiContextLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.aiContextPlaceholder}
                      className="min-h-40"
                      {...field}
                    />
                  </FormControl>
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
