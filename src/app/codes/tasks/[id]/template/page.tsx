
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTaskCode, updateTaskCode } from '@/lib/firebase';
import type { TaskCode } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/hooks/use-settings';

const translations = {
    en: {
        back: 'Back',
        editTemplate: 'Edit Task Template',
        editingFor: 'Editing template for task:',
        templateTitle: 'Description Template',
        templateDescription: 'Create a template for the subtask description. Use Jira\'s rich text format. You can use the <AI /> tag to dynamically generate content based on the AI Context provided in the main form.',
        templateContent: 'Template Content',
        templatePlaceholder: 'h2. Objective\n\n<AI prompt="Describe the objective of this task." system="Act as a technical writer." />',
        saveTemplate: 'Save Template',
        errorNotFound: 'Task not found.',
        errorLoad: 'Failed to load task data.',
        successSave: 'Template saved successfully.',
        errorSave: 'Failed to save the template.',
    },
    es: {
        back: 'Volver',
        editTemplate: 'Editar Plantilla de Tarea',
        editingFor: 'Editando plantilla para la tarea:',
        templateTitle: 'Plantilla de Descripción',
        templateDescription: 'Crea una plantilla para la descripción de la subtarea. Usa el formato de texto enriquecido de Jira. Puedes usar la etiqueta <AI /> para generar contenido dinámicamente basado en el Contexto de IA proporcionado en el formulario principal.',
        templateContent: 'Contenido de la Plantilla',
        templatePlaceholder: 'h2. Objetivo\n\n<AI prompt="Describe el objetivo de esta tarea." system="Actúa como un escritor técnico." />',
        saveTemplate: 'Guardar Plantilla',
        errorNotFound: 'Tarea no encontrada.',
        errorLoad: 'Fallo al cargar los datos de la tarea.',
        successSave: 'Plantilla guardada con éxito.',
        errorSave: 'Fallo al guardar la plantilla.',
    }
}

function TemplateSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-60 w-full" />
      <Skeleton className="h-10 w-24" />
    </div>
  );
}

export default function EditTaskTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const taskId = typeof params.id === 'string' ? params.id : '';
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;
  
  const [task, setTask] = useState<TaskCode | null>(null);
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    async function loadTask() {
      try {
        const taskData = await getTaskCode(taskId);
        if (taskData) {
          setTask(taskData);
          setTemplate(taskData.template || '');
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: t.errorNotFound,
          });
          router.push('/codes/tasks');
        }
      } catch (error) {
        console.error('Failed to load task:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: t.errorLoad,
        });
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [taskId, router, toast, t.errorLoad, t.errorNotFound]);

  const handleSave = async () => {
    if (!taskId) return;
    setSaving(true);
    try {
      await updateTaskCode(taskId, { template });
      toast({
        title: '✅ Success!',
        description: t.successSave,
      });
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t.errorSave,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href="/codes/tasks">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">{t.back}</span>
          </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
                {t.editTemplate}
            </h1>
            <p className="text-muted-foreground mt-1">
                {t.editingFor} <span className="font-semibold text-foreground">{task?.name || '...'}</span>
            </p>
        </div>
      </header>
      
      {loading ? (
        <TemplateSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t.templateTitle}</CardTitle>
            <CardDescription>
                {t.templateDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="template">{t.templateContent}</Label>
              <Textarea
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder={t.templatePlaceholder}
                className="min-h-80 font-mono"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.saveTemplate}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
