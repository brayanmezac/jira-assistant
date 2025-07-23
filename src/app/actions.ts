
'use server';

import { z } from 'zod';
import { generateJiraEpic } from '@/ai/flows/generate-jira-epic';
import { generateJiraStory } from '@/ai/flows/generate-jira-story';
import { jiraStoryFormSchema } from '@/lib/types';

export type FormState = {
  success: boolean;
  message: string;
  data?: {
    epic: string;
    story: string;
  };
};

export async function generateJiraTicketsAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = jiraStoryFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    number: Number(formData.get('number')),
    project: formData.get('project'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data. Please check your inputs.',
    };
  }

  const { name, description, number, project } = validatedFields.data;

  try {
    const [epicResult, storyResult] = await Promise.all([
      generateJiraEpic({
        featureDescription: description,
        projectName: project,
        storyName: name,
        numero: number,
      }),
      generateJiraStory({
        storyDescription: description,
        projectName: project,
        storyName: name,
        numero: number,
      }),
    ]);
    return {
      success: true,
      message: 'Successfully generated content.',
      data: {
        epic: epicResult.epicDescription,
        story: storyResult.jiraStory,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message:
        'An error occurred while generating the Jira tickets. Please try again.',
    };
  }
}
