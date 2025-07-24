'use server';

import { z } from 'zod';
import { generateJiraEpic } from '@/ai/flows/generate-jira-epic';
import { generateJiraStory } from '@/ai/flows/generate-jira-story';
import { jiraStoryFormSchema, jiraSettingsSchema } from '@/lib/types';
import { getTaskCodes, getProjectCodes } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export type FormState = {
  success: boolean;
  message: string;
  data?: {
    epic: string;
    story: string;
    storyName: string;
    projectKey: string;
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

    const projects = await getProjectCodes();
    const projectInfo = projects.find(p => p.name === project);
    const projectKey = projectInfo?.code || project.split(' ')[0];


    return {
      success: true,
      message: 'Successfully generated content.',
      data: {
        epic: epicResult.epicDescription,
        story: storyResult.jiraStory,
        storyName: name,
        projectKey: projectKey
      },
    };
  } catch (error) {
    console.error("Error in generateJiraTicketsAction: ", error);
    return {
      success: false,
      message:
        'An error occurred while generating the Jira tickets. Please try again.',
    };
  }
}

const createJiraTicketsInput = z.object({
    epicSummary: z.string(),
    epicDescription: z.string(),
    storySummary: z.string(),
    storyDescription: z.string(),
    projectKey: z.string(),
    settings: jiraSettingsSchema,
});

type CreateJiraTicketsInput = z.infer<typeof createJiraTicketsInput>;

type JiraResult = {
    success: boolean;
    message: string;
    data?: {
      epicKey: string;
    };
  };

export async function createJiraTickets(input: CreateJiraTicketsInput): Promise<JiraResult> {
    const { epicSummary, epicDescription, storySummary, storyDescription, projectKey, settings } = input;
    const { url, email, token } = settings;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    const headers = {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    try {
        // Step 1: Create Epic
        const epicPayload = {
            fields: {
                project: { key: projectKey },
                summary: epicSummary,
                description: epicDescription,
                issuetype: { name: 'Epic' },
                customfield_10011: epicSummary // 'Epic Name' custom field
            }
        };

        const epicResponse = await fetch(`${url}/rest/api/2/issue`, {
            method: 'POST',
            headers,
            body: JSON.stringify(epicPayload)
        });

        if (!epicResponse.ok) {
            const errorData = await epicResponse.text();
            console.error('Jira epic creation failed:', errorData);
            return { success: false, message: `Failed to create Epic: ${epicResponse.statusText}. ${errorData}` };
        }

        const epicData = await epicResponse.json();
        const epicKey = epicData.key;

        // Step 2: Create Story
        const storyPayload = {
            fields: {
                project: { key: projectKey },
                summary: storySummary,
                description: storyDescription,
                issuetype: { name: 'Story' },
                customfield_10014: epicKey // 'Epic Link' custom field
            }
        };
        
        const storyResponse = await fetch(`${url}/rest/api/2/issue`, {
            method: 'POST',
            headers,
            body: JSON.stringify(storyPayload)
        });

        if (!storyResponse.ok) {
            const errorData = await storyResponse.text();
            console.error('Jira story creation failed:', errorData);
            return { success: false, message: `Failed to create Story: ${storyResponse.statusText}. ${errorData}` };
        }
        
        const storyData = await storyResponse.json();
        const storyKey = storyData.key;
        
        // Step 3: Create Sub-tasks
        const subtaskList = await getTaskCodes();
        for (const subtask of subtaskList) {
          const subtaskPayload = {
            fields: {
              project: { key: projectKey },
              summary: subtask.name,
              issuetype: { name: 'Sub-task' },
              parent: { key: storyKey },
            },
          };
    
          const subtaskResponse = await fetch(`${url}/rest/api/2/issue`, {
            method: 'POST',
            headers,
            body: JSON.stringify(subtaskPayload),
          });
    
          if (!subtaskResponse.ok) {
            const errorData = await subtaskResponse.text();
            console.warn(`Failed to create subtask "${subtask.name}":`, errorData);
            // Don't fail the whole process if a subtask fails
          }
        }

        return { success: true, message: 'Tickets created successfully!', data: { epicKey } };

    } catch (error) {
        console.error('Error creating Jira tickets:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
