
'use client';

import { useActionState, useEffect, useState } from 'react';
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
  const [formKey, setFormKey] = useState(0);

  const form = useForm<z.infer<typeof jiraStoryFormSchema>>({
    resolver: zodResolver(jiraStoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      number: undefined,
      project: '',
      userId: user?.uid || '',
      model: 'googleai/gemini-1.5-flash-latest',
    },
  });
  
  // Watch for form values to pass to GeneratedContent
  const watchedValues = form.watch();

  // Sync userId to form if it changes and re-key the form to force re-initialization
  useEffect(() => {
    if (user) {
      form.reset({
        ...form.getValues(),
        userId: user.uid,
        model: 'googleai/gemini-1.5-flash-latest', // Ensure model has a default on reset
      });
      setFormKey(prevKey => prevKey + 1);
    }
  }, [user, form]);
  
  useEffect(() => {
    if (state && !state.success && state.message) {
      toast({
        variant: 'destructive',
        title: 'Preparation Failed',
        description: state.message,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <FormProvider {...form}>
      <GeneratorForm formAction={formAction} key={formKey} />
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
