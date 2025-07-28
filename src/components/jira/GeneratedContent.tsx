
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Clipboard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubtasksPreview } from './SubtasksPreview';
import { useSettings } from '@/hooks/use-settings';
import { createJiraTickets } from '@/app/actions';
import type { TaskCode } from '@/lib/types';

type GeneratedContentProps = {
  storyDescription: string;
  storyName: string;
  projectKey: string;
  storyNumber: number;
  tasks: TaskCode[];
};

const translations = {
    en: {
        copy: 'Copy',
        devStoryContent: 'Development Story Content',
        devStoryDescription: 'This is the content that will be used for the main development sub-task.',
        finalStep: 'Final Step',
        finalStepDescription: 'Once you\'re happy with the content, create the tickets in Jira.',
        createInJira: 'Create in Jira',
        creatingInJira: 'Creating in Jira...',
        configMissingTitle: 'Configuration Missing',
        configMissingDescription: 'Please configure your Jira settings before creating tickets.',
        successTitle: '✅ Success!',
        successDescription: 'Jira tickets created successfully.',
        viewStory: 'View Story on Jira',
        creationFailedTitle: 'Jira Creation Failed',
        clientErrorTitle: 'Client-side Error',
        clientErrorDescription: 'An unexpected error occurred. Check the browser console.',
    },
    es: {
        copy: 'Copiar',
        devStoryContent: 'Contenido de la Historia de Desarrollo',
        devStoryDescription: 'Este es el contenido que se usará para la subtarea principal de desarrollo.',
        finalStep: 'Paso Final',
        finalStepDescription: 'Cuando estés satisfecho con el contenido, crea los tickets en Jira.',
        createInJira: 'Crear en Jira',
        creatingInJira: 'Creando en Jira...',
        configMissingTitle: 'Configuración Faltante',
        configMissingDescription: 'Por favor, configura tus ajustes de Jira antes de crear tickets.',
        successTitle: '✅ ¡Éxito!',
        successDescription: 'Tickets de Jira creados con éxito.',
        viewStory: 'Ver Historia en Jira',
        creationFailedTitle: 'Falló la Creación en Jira',
        clientErrorTitle: 'Error del Lado del Cliente',
        clientErrorDescription: 'Ocurrió un error inesperado. Revisa la consola del navegador.',
    }
};

function ContentDisplay({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={handleCopy}
      >
        {copied ? <CheckCircle className="text-green-500" /> : <Clipboard />}
        <span className="sr-only">{t.copy}</span>
      </Button>
      <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-muted/50 p-4 h-96 overflow-auto whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

export function GeneratedContent({ storyDescription, storyName, projectKey, storyNumber, tasks }: GeneratedContentProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;
  
  const handleCreateInJira = async () => {
    setIsCreating(true);
    
    if (!settings.url || !settings.email || !settings.token) {
        toast({
          variant: 'destructive',
          title: t.configMissingTitle,
          description: t.configMissingDescription,
        });
        setIsCreating(false);
        return;
    }

    const storySummary = `${projectKey}_${storyNumber} - ${storyName}`;
    
    try {
        const result = await createJiraTickets({
            storySummary: storySummary,
            storyNumber: storyNumber,
            storyDescription: storyDescription,
            projectKey: projectKey,
            settings: settings,
            tasks: tasks
        });

        if (result.success && result.data) {
            const storyUrl = `${settings.url}/browse/${result.data.storyKey}`;
            toast({
              title: t.successTitle,
              description: (
                <p>
                  {t.successDescription}{' '}
                  <a 
                    href={storyUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    {t.viewStory}
                  </a>
                </p>
              ),
              duration: 10000,
            });
        } else {
            toast({
                variant: 'destructive',
                title: t.creationFailedTitle,
                description: result.message,
            });
        }
    } catch (error) {
        console.error("Error in handleCreateInJira:", error);
        toast({
            variant: 'destructive',
            title: t.clientErrorTitle,
            description: t.clientErrorDescription,
        });
    } finally {
        setIsCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      <div className="lg:col-span-2">
         <Card>
            <CardHeader>
            <CardTitle>{t.devStoryContent}</CardTitle>
            <CardDescription>
                {t.devStoryDescription}
            </CardDescription>
            </CardHeader>
            <CardContent>
            <ContentDisplay content={storyDescription} />
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <SubtasksPreview tasks={tasks} />
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t.finalStep}</CardTitle>
            <CardDescription>
              {t.finalStepDescription}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={handleCreateInJira} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.creatingInJira}
                </>
              ) : (
                t.createInJira
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
