
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectCode, updateProjectCode } from '@/lib/firebase';
import type { ProjectCode } from '@/lib/types';
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
        editTemplate: 'Edit Template',
        editingFor: 'Editing template for project:',
        saveTemplate: 'Save Template',
        errorNotFound: 'Project not found.',
        errorLoad: 'Failed to load project data.',
        successSave: 'Template saved successfully.',
        errorSave: 'Failed to save the template.',
    },
    es: {
        back: 'Volver',
        editTemplate: 'Editar Plantilla',
        editingFor: 'Editando plantilla para el proyecto:',
        saveTemplate: 'Guardar Plantilla',
        errorNotFound: 'Proyecto no encontrado.',
        errorLoad: 'Fallo al cargar los datos del proyecto.',
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

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = typeof params.id === 'string' ? params.id : '';
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;
  
  const [project, setProject] = useState<ProjectCode | null>(null);
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    async function loadProject() {
      try {
        const projectData = await getProjectCode(projectId);
        if (projectData) {
          setProject(projectData);
          setTemplate(projectData.template || '');
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: t.errorNotFound,
          });
          router.push('/codes/projects');
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: t.errorLoad,
        });
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [projectId, router, toast, t.errorLoad, t.errorNotFound]);

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await updateProjectCode(projectId, { template });
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
          <Link href="/codes/projects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">{t.back}</span>
          </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
                {t.editTemplate}
            </h1>
            <p className="text-muted-foreground mt-1">
                {t.editingFor} <span className="font-semibold text-foreground">{project?.name || '...'}</span>
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
