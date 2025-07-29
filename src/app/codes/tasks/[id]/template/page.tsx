
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTaskCode, updateTaskCode } from '@/lib/firebase';
import type { TaskCode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/hooks/use-settings';
import { TemplateEditor } from '@/components/codes/TemplateEditor';

const translations = {
    en: {
        back: 'Back',
        editTemplate: 'Edit Task Template',
        editingFor: 'Editing template for task:',
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
         <TemplateEditor
            template={template}
            onTemplateChange={setTemplate}
            onSave={handleSave}
            saving={saving}
            lang={(settings.language as 'en' | 'es') || 'en'}
        />
      )}
    </div>
  );
}
