
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Clipboard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubtasksPreview } from './SubtasksPreview';
import { useSettings } from '@/hooks/use-settings';
import { createJiraTickets } from '@/app/actions';
import type { TaskCode } from '@/lib/types';
import { renderJiraMarkup } from '@/lib/jira-markup-renderer';
import { useAuth } from '../auth/AuthProvider';

type GeneratedContentProps = {
  storyDescription: string;
  storyName: string;
  projectKey: string;
  storyNumber: number;
  tasks: TaskCode[];
  aiContext: string;
  userId: string;
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

function ContentDisplay({ content, onCopy }: { content: string, onCopy: () => void }) {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={onCopy}
      >
        <Clipboard />
      </Button>
      <div 
        className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-muted/50 p-4 h-96 overflow-auto"
        dangerouslySetInnerHTML={{ __html: renderJiraMarkup(content) }}
      />
    </div>
  );
}

export function GeneratedContent({ storyDescription, storyName, projectKey, storyNumber, tasks, aiContext, userId }: GeneratedContentProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;
  
  // State for progressive rendering
  const [showStory, setShowStory] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [visibleTasks, setVisibleTasks] = useState<TaskCode[]>([]);
  const [showFinalStep, setShowFinalStep] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const autoScroll = () => {
    setTimeout(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
        });
    }, 100);
  };
  
  useEffect(() => {
    // Preload audio
    audioRef.current = new Audio('/ping.mp3');
  }, []);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    // Reset states on new generation
    setShowStory(false);
    setShowSubtasks(false);
    setVisibleTasks([]);
    setShowFinalStep(false);

    // 1. Show Story Card
    timeouts.push(setTimeout(() => {
      setShowStory(true);
      autoScroll();
    }, 500));

    // 2. Show Subtasks Card
    timeouts.push(setTimeout(() => {
      setShowSubtasks(true);
      autoScroll();
    }, 1000));

    // 3. Show Subtasks one by one
    tasks.forEach((task, index) => {
      timeouts.push(setTimeout(() => {
        setVisibleTasks(prev => [...prev, task]);
        autoScroll();
      }, 1500 + index * 400));
    });

    // 4. Show Final Step and play sound
    timeouts.push(setTimeout(() => {
      setShowFinalStep(true);
      audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
      autoScroll();
    }, 1500 + tasks.length * 400 + 300));

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [storyDescription, tasks]);


  const handleCreateInJira = async () => {
    setIsCreating(true);
    
    if (!userId) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to create tickets.',
        });
        setIsCreating(false);
        return;
    }

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
        const result = await createJiraTickets(userId, {
            storySummary: storySummary,
            storyNumber: storyNumber,
            storyDescription: storyDescription,
            projectKey: projectKey,
            settings: settings,
            tasks: tasks,
            aiContext: aiContext,
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
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
        title: 'Copied to clipboard!',
    });
  };

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      <div className="lg:col-span-2 space-y-8">
        {showStory && (
            <Card className="animate-in-chat">
                <CardHeader>
                <CardTitle>{t.devStoryContent}</CardTitle>
                <CardDescription>
                    {t.devStoryDescription}
                </CardDescription>
                </CardHeader>
                <CardContent>
                <ContentDisplay content={storyDescription} onCopy={() => handleCopy(storyDescription)} />
                </CardContent>
            </Card>
        )}
      </div>

      <div className="lg:col-span-1 space-y-8">
        {showSubtasks && <SubtasksPreview tasks={visibleTasks} />}
        
        {showFinalStep && (
            <Card className="animate-in-chat">
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
        )}
      </div>
    </div>
  );
}
