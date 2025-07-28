
'use client';

import { useActionState } from 'react';
import { generateJiraTicketsAction, type FormState } from '@/app/actions';
import { GeneratorForm } from './GeneratorForm';
import { GeneratedContent } from './GeneratedContent';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { jiraStoryFormSchema } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../auth/AuthProvider';

const initialState: FormState = {
  success: false,
  message: '',
};

export function JiraGenerator() {
  const [state, formAction] = useActionState(
    generateJiraTicketsAction,
    initialState
  );
  const { toast } = useToast();
  const { user } = useAuth();
  const [aiContext, setAiContext] = useState('');

  const form = useForm<z.infer<typeof jiraStoryFormSchema>>({
    resolver: zodResolver(jiraStoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      number: '' as any,
      project: '',
      userId: user?.uid || '',
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue('userId', user.uid);
    }
  }, [user, form]);
  
  useEffect(() => {
    if (state?.success && state.data) {
        setAiContext(form.getValues('description'));
    }
    if (state && !state.success && state.message) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.message,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, toast]);

  return (
    <FormProvider {...form}>
      <GeneratorForm formAction={formAction} initialState={initialState} />
      {state.success && state.data ? (
        <GeneratedContent
          storyDescription={state.data.storyDescription}
          storyName={state.data.storyName}
          projectKey={state.data.projectKey}
          storyNumber={state.data.storyNumber}
          tasks={state.data.tasks}
          aiContext={aiContext}
        />
      ) : !state.success && state.message ? (
        <Alert variant="destructive" className="mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Preparation Failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
    </FormProvider>
  );
}
