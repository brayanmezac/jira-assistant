'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clipboard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubtasksPreview } from './SubtasksPreview';
import { useSettings } from '@/hooks/use-settings';
import { createJiraTickets } from '@/app/actions';

type GeneratedContentProps = {
  epic: string;
  story: string;
  storyName: string;
  projectKey: string;
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

export function GeneratedContent({ epic, story, storyName, projectKey }: GeneratedContentProps) {
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
    
    const result = await createJiraTickets({
        epicSummary: storyName,
        epicDescription: epic,
        storySummary: storyName,
        storyDescription: story,
        projectKey: projectKey,
        settings: settings,
      });


    if (result.success && result.data) {
        const epicUrl = `${settings.url}/browse/${result.data.epicKey}`;
        toast({
          title: "✅ Success!",
          description: (
            <p>
              Jira tickets created successfully. {' '}
              <a 
                href={epicUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                View Epic on Jira
              </a>
            </p>
          ),
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Jira Creation Failed',
            description: result.message,
        });
    }

    setIsCreating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      <div className="lg:col-span-2">
        <Tabs defaultValue="epic">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="epic">Epic</TabsTrigger>
            <TabsTrigger value="story">Development Story</TabsTrigger>
          </TabsList>
          <TabsContent value="epic">
            <Card>
              <CardHeader>
                <CardTitle>Generated Epic</CardTitle>
                <CardDescription>
                  This is the AI-generated epic for your feature.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentDisplay content={epic} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="story">
            <Card>
              <CardHeader>
                <CardTitle>Generated Development Story</CardTitle>
                <CardDescription>
                  This is the detailed, AI-generated technical story.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentDisplay content={story} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
