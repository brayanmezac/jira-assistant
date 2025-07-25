
'use server';

import { z } from 'zod';
import {
  jiraStoryFormSchema,
  jiraSettingsSchema,
  jiraIssueTypeSchema,
  type TaskCode,
} from '@/lib/types';
import { getTaskCodes, getProjectCodes, getProjectCode } from '@/lib/firebase';
import { generateText } from '@/ai/flows/generic-text-generation';


export type FormState = {
  success: boolean;
  message: string;
  data?: {
    storyDescription: string;
    storyName: string;
    projectKey: string;
    storyNumber: number;
    tasks: TaskCode[];
  };
};

/**
 * Processes a template string, finding all <AI> tags and replacing them with AI-generated content.
 * @param template The template string to process.
 * @param context The user-provided context to inject into the AI prompt.
 * @returns The processed string with the AI content injected.
 */
async function processTemplateWithAI(template: string, context: string): Promise<string> {
    const aiTagRegex = /<AI\s+([^>]+)\s*\/>/s;
    let processedTemplate = template;
    let match;

    // Use a loop to find and replace all AI tags one by one
    while ((match = processedTemplate.match(aiTagRegex)) !== null) {
        const fullMatch = match[0];
        const attrsString = match[1];

        const getAttr = (name: string) => {
            const regex = new RegExp(`${name}="([^"]+)"`);
            const attrMatch = attrsString.match(regex);
            return attrMatch ? attrMatch[1] : '';
        };

        const prompt = getAttr('prompt');
        const system = getAttr('system');
        
        // Combine the prompt from the tag with the user-provided context
        const fullPrompt = `${prompt}\n\nContexto:\n\`\`\`\n${context}\n\`\`\``;

        try {
            const aiResult = await generateText({
                prompt: fullPrompt,
                systemInstruction: system,
            });
            // Replace the current AI tag with the generated text
            processedTemplate = processedTemplate.replace(fullMatch, aiResult.generatedText);
        } catch (error) {
            console.error("Error during AI tag processing:", error);
            const errorMessage = `[AI Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}]`;
            // Replace the tag with an error message to avoid infinite loops on failure
            processedTemplate = processedTemplate.replace(fullMatch, errorMessage);
        }
    }

    return processedTemplate;
}


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

  const { name, description, project, number } = validatedFields.data;

  try {
    const projects = await getProjectCodes();
    const projectInfo = projects.find((p) => p.name === project);

    if (!projectInfo || !projectInfo.id) {
      return {
        success: false,
        message: `Could not find a valid project for "${project}".`,
      };
    }
    
    // Fetch full project details to get the template
    const fullProject = await getProjectCode(projectInfo.id);
    const template = fullProject?.template || ''; // Default to empty if no template
    
    // Process the template, which may or may not involve an AI call
    const finalDescription = await processTemplateWithAI(template, description);

    const projectKey = projectInfo.code;
    const subtasks = await getTaskCodes();

    return {
      success: true,
      message: 'Content ready for Jira.',
      data: {
        storyDescription: finalDescription, // Use the template-processed description
        storyName: name,
        projectKey: projectKey,
        storyNumber: number,
        tasks: subtasks,
      },
    };
  } catch (error: any) {
    console.error('Error in generateJiraTicketsAction:', error);
    return {
      success: false,
      message: `An error occurred while preparing the Jira tickets. Please try again. (Details: ${error.message})`,
    };
  }
}

const createJiraTicketsInput = z.object({
  storySummary: z.string(),
  storyNumber: z.number(),
  storyDescription: z.string(),
  projectKey: z.string(),
  settings: jiraSettingsSchema,
  tasks: z.array(z.any()),
});

type CreateJiraTicketsInput = z.infer<typeof createJiraTicketsInput>;

type JiraResult = {
  success: boolean;
  message: string;
  data?: {
    storyKey: string;
  };
};

export async function createJiraTickets(
  input: CreateJiraTicketsInput
): Promise<JiraResult> {
  const {
    storySummary,
    storyNumber,
    storyDescription,
    projectKey,
    settings,
    tasks
  } = input;
  const { url, email, token, storyIssueTypeId } = settings;

  if (!url || !email || !token) {
    return {
      success: false,
      message: 'Jira connection settings are incomplete. Please check your settings.',
    };
  }
   if (!storyIssueTypeId) {
    return {
        success: false,
        message: 'Story issue type is not configured in Settings. Please select it and save.'
    }
   }

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    // Step 1: Create the main story
    const storyPayload = {
      fields: {
        project: { key: projectKey },
        summary: storySummary,
        description: storyDescription,
        issuetype: { id: storyIssueTypeId },
      },
    };

    console.log(
      '[JIRA DEBUG] Creating Story with payload:',
      JSON.stringify(storyPayload, null, 2)
    );
    const storyResponse = await fetch(`${url}/rest/api/2/issue`, {
      method: 'POST',
      headers,
      body: JSON.stringify(storyPayload),
    });

    if (!storyResponse.ok) {
       if (storyResponse.status === 401 || storyResponse.status === 403) {
        return {
          success: false,
          message: 'Jira authentication failed. Check your email and API token in settings.',
        };
      }
      const errorData = await storyResponse.text();
      console.error('[JIRA DEBUG] Failed to create Story:', {
        status: storyResponse.status,
        statusText: storyResponse.statusText,
        data: errorData,
      });
      return {
        success: false,
        message: `Failed to create Story: ${storyResponse.statusText}. ${errorData}`,
      };
    }

    const storyData = await storyResponse.json();
    const storyKey = storyData.key;
    console.log('[JIRA DEBUG] Story created successfully:', storyData);

    // Step 2: Create sub-tasks
    console.log(`[JIRA DEBUG] Found ${tasks.length} sub-tasks to create.`);
    for (const subtask of tasks) {
      const subtaskSummary = `${projectKey}_${storyNumber}_${subtask.type} ${subtask.name}`;

      // Conditional description for development task
      let subtaskDescription = '';
      if (subtask.type.startsWith('TDEV')) { // Check if it's a development task by its type prefix
        subtaskDescription = `h2. *Datos de la KB*

* *Nombre:* ${storySummary}
* *Genexus:* GX 17 U13
* *Info:* [Datos KB|https://link.com]


***

${storyDescription}

Se adjunta estimador:`;
      }


      const subtaskPayload = {
        fields: {
          project: { key: projectKey },
          summary: subtaskSummary,
          description: subtaskDescription,
          issuetype: { id: subtask.code },
          parent: { key: storyKey },
        },
      };

      console.log(`[JIRA DEBUG] Creating Sub-task "${subtask.name}"`);
      const subtaskResponse = await fetch(`${url}/rest/api/2/issue`, {
        method: 'POST',
        headers,
        body: JSON.stringify(subtaskPayload),
      });

      if (!subtaskResponse.ok) {
        const errorData = await subtaskResponse.text();
        console.warn(`[JIRA WARN] Failed to create subtask "${subtask.name}": ${errorData}`);
      }
    }
    console.log('[JIRA DEBUG] Sub-task creation process finished.');

    return {
      success: true,
      message: 'Tickets created successfully!',
      data: { storyKey },
    };
  } catch (error: any) {
    console.error(
      '[JIRA DEBUG] An unexpected error occurred during ticket creation:',
      error
    );
    return {
      success: false,
      message: `An unexpected error occurred: ${error.message}`,
    };
  }
}

type ValidationResult = {
  success: boolean;
  message?: string;
};

const validationInputSchema = z.object({
  projectCode: z.string(),
  settings: jiraSettingsSchema,
});

export async function validateJiraProject(
  input: z.infer<typeof validationInputSchema>
): Promise<ValidationResult> {
  const { projectCode, settings } = input;
  const { url, email, token } = settings;

  if (!url || !email || !token) {
    return {
      success: false,
      message: 'Jira settings are not configured.',
    };
  }

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${url}/rest/api/2/project/${projectCode}`, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      return { success: true };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: `Project with code "${projectCode}" not found in Jira.`,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message:
          'Authentication failed. Check your email and API token in settings.',
      };
    }

    const errorText = await response.text();
    return {
      success: false,
      message: `Jira API error: ${response.statusText}. ${errorText}`,
    };
  } catch (error: any) {
    console.error('[JIRA VALIDATION ERROR]', error);
    return {
      success: false,
      message: `Failed to connect to Jira. Check the URL and your network connection. Error: ${error.message}`,
    };
  }
}

const jiraApiProjectSchema = z.object({
  key: z.string(),
  name: z.string(),
});
export type JiraApiProject = z.infer<typeof jiraApiProjectSchema>;

type FetchJiraProjectsResult = {
  success: boolean;
  message?: string;
  projects?: JiraApiProject[];
};

export async function getJiraProjects(
  settings: z.infer<typeof jiraSettingsSchema>
): Promise<FetchJiraProjectsResult> {
  const { url, email, token } = settings;

  if (!url || !email || !token) {
    return {
      success: false,
      message:
        'Jira settings are not configured. Please add them on the Settings page.',
    };
  }

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${url}/rest/api/2/project`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message:
            'Authentication failed. Check your email and API token in settings.',
        };
      }
      const errorText = await response.text();
      return {
        success: false,
        message: `Jira API error: ${response.statusText}. ${errorText}`,
      };
    }

    const data = await response.json();
    const projects = z.array(jiraApiProjectSchema).parse(data);

    return { success: true, projects };
  } catch (error: any) {
    console.error('[JIRA FETCH PROJECTS ERROR]', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `Received an unexpected data format from Jira. Details: ${error.message}`,
      };
    }
    return {
      success: false,
      message: `Failed to connect to Jira. Check the URL and your network connection. Error: ${error.message}`,
    };
  }
}

export type JiraApiIssueType = z.infer<typeof jiraIssueTypeSchema>;

type FetchJiraIssueTypesResult = {
  success: boolean;
  message?: string;
  issueTypes?: JiraApiIssueType[];
};

export async function getJiraIssueTypes(
  settings: z.infer<typeof jiraSettingsSchema>
): Promise<FetchJiraIssueTypesResult> {
  const { url, email, token } = settings;

  if (!url || !email || !token) {
    return {
      success: false,
      message:
        'Jira settings are not configured. Please add them on the Settings page.',
    };
  }

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${url}/rest/api/2/issuetype`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message:
            'Authentication failed. Check your email and API token in settings.',
        };
      }
      const errorText = await response.text();
      return {
        success: false,
        message: `Jira API error: ${response.statusText}. ${errorText}`,
      };
    }

    const data = await response.json();
    const issueTypes = z.array(jiraIssueTypeSchema).parse(data);

    return { success: true, issueTypes };
  } catch (error: any) {
    console.error('[JIRA FETCH ISSUE TYPES ERROR]', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `Received an unexpected data format from Jira. Details: ${error.message}`,
      };
    }
    return {
      success: false,
      message: `Failed to connect to Jira. Check the URL and your network connection. Error: ${error.message}`,
    };
  }
}

    