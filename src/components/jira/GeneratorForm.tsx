'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { jiraStoryFormSchema } from '@/lib/types';

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
import { Bot } from 'lucide-react';

type GeneratorFormProps = {
  formAction: (payload: FormData) => void;
  initialState: any;
};

export function GeneratorForm({ formAction, initialState }: GeneratorFormProps) {
  const form = useForm<z.infer<typeof jiraStoryFormSchema>>({
    resolver: zodResolver(jiraStoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      number: undefined,
      project: 'Tablero Proyecto Prueba 2.0',
    },
    context: initialState,
  });

  return (
    <Form {...form}>
      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Story</CardTitle>
            <CardDescription>Fill in the details below to generate a new Jira story and epic with AI.</CardDescription>
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
                      <SelectItem value="Tablero Proyecto Prueba 2.0">
                        Tablero Proyecto Prueba 2.0
                      </SelectItem>
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
                      <Input type="number" placeholder="e.g., 123" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
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
                    This is the context the AI will use to generate the tickets. Be as detailed as possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <SubmitButton loadingText="Generating...">
                <Bot className="mr-2"/>
                Generate with AI
            </SubmitButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
