'use client';

import { useActionState } from 'react';
import { generateJiraTicketsAction, type FormState } from '@/app/actions';
import { GeneratorForm } from './GeneratorForm';
import { GeneratedContent } from './GeneratedContent';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';

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

  useEffect(() => {
    if (!state.success && state.message) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div>
      <GeneratorForm formAction={formAction} initialState={initialState} />
      {state.success && state.data ? (
        <GeneratedContent 
          storyDescription={state.data.storyDescription}
          storyName={state.data.storyName}
          projectKey={state.data.projectKey} 
          storyNumber={state.data.storyNumber}
          tasks={state.data.tasks}
        />
      ) : !state.success && state.message ? (
         <Alert variant="destructive" className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
         </Alert>
      ) : null}
    </div>
  );
}
