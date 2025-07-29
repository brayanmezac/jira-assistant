
'use client';

import { useActionState, useEffect } from 'react';
import { generateJiraTicketsAction, type FormState } from '@/app/actions';
import { GeneratorForm } from './GeneratorForm';
import { GeneratedContent } from './GeneratedContent';
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

  const form = useForm<z.infer<typeof jiraStoryFormSchema>>({
    resolver: zodResolver(jiraStoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      number: undefined,
      project: '',
      userId: '',
      model: 'googleai/gemini-1.5-flash-latest',
    },
  });
  
  // Watch for form values to pass to GeneratedContent
  const watchedValues = form.watch();

  // Sync userId to form if it changes (e.g., after initial load)
  useEffect(() => {
    if (user && form.getValues('userId') !== user.uid) {
      form.setValue('userId', user.uid);
    }
  }, [user, form]);
  
  useEffect(() => {
    if (state && !state.success && state.message) {
      // Don't show toast if form is dirty, as RHF will show field errors
      if (form.formState.isSubmitted && form.formState.isDirty) return;
      
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.message,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <FormProvider {...form}>
      <GeneratorForm formAction={formAction} />
      {state.success && state.data ? (
        <GeneratedContent
          storyDescription={state.data.storyDescription}
          storyName={state.data.storyName}
          projectKey={state.data.projectKey}
          storyNumber={state.data.storyNumber}
          tasks={state.data.tasks}
          aiContext={watchedValues.description || ''}
          model={watchedValues.model}
        />
      ) : !state.success && state.message && form.formState.isSubmitted && !form.formState.isDirty ? (
        <Alert variant="destructive" className="mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Preparation Failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
    </FormProvider>
  );
}
