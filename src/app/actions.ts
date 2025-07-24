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
  } catch (error: any) {
    console.error("[AI-GEN ERROR] Error in generateJiraTicketsAction: ", error);
    const errorMessage = error.message || 'An unknown error occurred during AI generation.';
    return {
      success: false,
      message: `An error occurred while generating the Jira tickets. Please try again. (Details: ${errorMessage})`,
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
    console.log('[JIRA DEBUG] Starting ticket creation process with input:', {
        ...input,
        settings: { ...input.settings, token: '...hidden...' }
    });
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

        console.log('[JIRA DEBUG] Attempting to create Epic with payload:', JSON.stringify(epicPayload, null, 2));

        const epicResponse = await fetch(`${url}/rest/api/2/issue`, {
            method: 'POST',
            headers,
            body: JSON.stringify(epicPayload)
        });

        if (!epicResponse.ok) {
            const errorData = await epicResponse.text();
            console.error('[JIRA DEBUG] Jira epic creation failed. Status:', epicResponse.status, 'Response:', errorData);
            return { success: false, message: `Failed to create Epic: ${epicResponse.statusText}. ${errorData}` };
        }

        const epicData = await epicResponse.json();
        const epicKey = epicData.key;
        console.log('[JIRA DEBUG] Epic created successfully. Key:', epicKey);

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
        
        console.log('[JIRA DEBUG] Attempting to create Story with payload:', JSON.stringify(storyPayload, null, 2));
        
        const storyResponse = await fetch(`${url}/rest/api/2/issue`, {
            method: 'POST',
            headers,
            body: JSON.stringify(storyPayload)
        });

        if (!storyResponse.ok) {
            const errorData = await storyResponse.text();
            console.error('[JIRA DEBUG] Jira story creation failed. Status:', storyResponse.status, 'Response:', errorData);
            return { success: false, message: `Failed to create Story: ${storyResponse.statusText}. ${errorData}` };
        }
        
        const storyData = await storyResponse.json();
        const storyKey = storyData.key;
        console.log('[JIRA DEBUG] Story created successfully. Key:', storyKey);
        
        // Step 3: Create Sub-tasks
        const subtaskList = await getTaskCodes();
        console.log(`[JIRA DEBUG] Found ${subtaskList.length} sub-tasks to create.`);
        for (const subtask of subtaskList) {
          const subtaskPayload = {
            fields: {
              project: { key: projectKey },
              summary: subtask.name,
              issuetype: { name: 'Sub-task' },
              parent: { key: storyKey },
            },
          };
    
          console.log(`[JIRA DEBUG] Attempting to create Sub-task "${subtask.name}" with payload:`, JSON.stringify(subtaskPayload, null, 2));

          const subtaskResponse = await fetch(`${url}/rest/api/2/issue`, {
            method: 'POST',
            headers,
            body: JSON.stringify(subtaskPayload),
          });
    
          if (!subtaskResponse.ok) {
            const errorData = await subtaskResponse.text();
            console.warn(`[JIRA DEBUG] Failed to create subtask "${subtask.name}". Status:`, subtaskResponse.status, 'Response:', errorData);
          } else {
            const subtaskData = await subtaskResponse.json();
            console.log(`[JIRA DEBUG] Sub-task "${subtask.name}" created successfully. Key:`, subtaskData.key);
          }
        }

        console.log('[JIRA DEBUG] Ticket creation process completed successfully.');
        return { success: true, message: 'Tickets created successfully!', data: { epicKey } };

    } catch (error) {
        console.error('[JIRA DEBUG] An unexpected error occurred in createJiraTickets:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
