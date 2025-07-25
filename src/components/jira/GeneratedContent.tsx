
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

function ContentDisplay({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

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
        <span className="sr-only">Copy</span>
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
  
  const handleCreateInJira = async () => {
    setIsCreating(true);
    
    if (!settings.url || !settings.email || !settings.token) {
        toast({
          variant: 'destructive',
          title: 'Configuration Missing',
          description: 'Please configure your Jira settings before creating tickets.',
        });
        setIsCreating(false);
        return;
    }

    const storySummary = `${projectKey}_${storyNumber} - ${storyName}`;
    
    try {
        const result = await createJiraTickets({
            storySummary: storySummary,
            storyDescription: storyDescription,
            projectKey: projectKey,
            settings: settings,
            tasks: tasks
        });

        if (result.success && result.data) {
            const storyUrl = `${settings.url}/browse/${result.data.storyKey}`;
            toast({
              title: "✅ Success!",
              description: (
                <p>
                  Jira tickets created successfully. {' '}
                  <a 
                    href={storyUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    View Story on Jira
                  </a>
                </p>
              ),
              duration: 10000,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Jira Creation Failed',
                description: result.message,
            });
        }
    } catch (error) {
        console.error("Error in handleCreateInJira:", error);
        toast({
            variant: 'destructive',
            title: 'Client-side Error',
            description: 'An unexpected error occurred. Check the browser console.',
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
            <CardTitle>Development Story Content</CardTitle>
            <CardDescription>
                This is the content that will be used for the main development sub-task.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <ContentDisplay content={storyDescription} />
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <SubtasksPreview />
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Final Step</CardTitle>
            <CardDescription>
              Once you're happy with the content, create the tickets in Jira.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={handleCreateInJira} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating in Jira...
                </>
              ) : (
                'Create in Jira'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    