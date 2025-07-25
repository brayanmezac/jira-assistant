'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectCode, updateProjectCode } from '@/lib/firebase';
import type { ProjectCode } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
            description: 'Project not found.',
          });
          router.push('/codes/projects');
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load project data.',
        });
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [projectId, router, toast]);

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await updateProjectCode(projectId, { template });
      toast({
        title: '✅ Success!',
        description: 'Template saved successfully.',
      });
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save the template.',
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
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
                Edit Template
            </h1>
            <p className="text-muted-foreground mt-1">
                Editing template for project: <span className="font-semibold text-foreground">{project?.name || '...'}</span>
            </p>
        </div>
      </header>
      
      {loading ? (
        <TemplateSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Description Template</CardTitle>
            <CardDescription>
                Create a template for the story description. Use Jira's rich text format. 
                You can use the <code className="bg-muted px-1 py-0.5 rounded-sm font-mono text-sm">{'<AI />'}</code> tag to dynamically generate content based on the AI Context provided in the main form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="template">Template Content</Label>
              <Textarea
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder={'h2. Objetivo\n\n<AI prompt="Describe el objetivo de esta historia." />'}
                className="min-h-80 font-mono"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Template
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
