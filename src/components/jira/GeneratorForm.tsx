
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

type GeneratorFormProps = {
  formAction: (payload: FormData) => void;
  initialState: any;
};

export function GeneratorForm({ formAction, initialState }: GeneratorFormProps) {
    const [projects, setProjects] = useState<ProjectCode[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            const projectList = await getProjectCodes();
            setProjects(projectList);
        };
        fetchProjects();
    }, []);

  const form = useForm<z.infer<typeof jiraStoryFormSchema>>({
    resolver: zodResolver(jiraStoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      number: '' as any, // Changed from undefined to empty string
      project: '',
    },
    context: initialState,
  });

  return (
    <Form {...form}>
      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Story</CardTitle>
            <CardDescription>Fill in the details below to generate a new Jira story and subtasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    name={field.name}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
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
                    <FormLabel>Story Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Implement user authentication" {...field} />
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
                    <FormLabel>Story Number</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 123" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/>
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
                  <FormLabel>Story Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide all relevant information, meeting notes, and technical details for the story..."
                      className="min-h-40"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This content will be used as the main description for the story and development sub-task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <SubmitButton loadingText="Preparing...">
                <PencilLine className="mr-2"/>
                Prepare for Jira
            </SubmitButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

    