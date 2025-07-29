
'use server';

import { z } from 'zod';
import OpenAI from 'openai';
import {
  jiraStoryFormSchema,
  jiraSettingsSchema,
  jiraIssueTypeSchema,
  type TaskCode,
} from '@/lib/types';
import { getTaskCodes, getProjectCodes, getProjectCode } from '@/lib/firebase';
import { generateText } from '@/ai/flows/generic-text-generation';
import { ModelReference } from 'genkit/model';

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

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateWithOpenAI(model: string, system: string, prompt: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
    });
    return response.choices[0].message.content || '';
}


/**
 * Processes a template string, finding all <AI> tags and replacing them with AI-generated content
 * in a single batch request to optimize token usage.
 * If the context is empty, it removes the AI tags instead of calling the AI.
 * @param template The template string to process.
 * @param context The user-provided context to inject into the AI prompt. Can be empty.
 * @param model The AI model to use.
 * @returns The processed string with the AI content injected or tags removed.
 */
async function processTemplateWithAI(template: string, context: string, model: ModelReference | string): Promise<string> {
    const aiTagRegex = /<AI\s+([^>]+)\s*\/>/gs;

    // If context is empty, just strip the AI tags and return the template.
    if (!context.trim()) {
        return template.replace(aiTagRegex, '');
    }

    let processedTemplate = template;
    const matches = Array.from(template.matchAll(aiTagRegex));

    if (matches.length === 0) {
        return template;
    }
    
    // Create a single prompt that asks the AI to act as a JSON service
    // and generate all required parts at once.
    const prompts = matches.map((match, index) => {
        const attrsString = match[1];
        const getAttr = (name: string) => {
            const regex = new RegExp(`${name}="([^"]+)"`);
            const attrMatch = attrsString.match(regex);
            return attrMatch ? attrMatch[1] : '';
        };

        const prompt = getAttr('prompt');
        const system = getAttr('system');
        const maxLines = getAttr('maxLines') || '5'; // Default to 5 lines

        return {
            id: `output_${index}`,
            prompt: prompt,
            system: system,
            maxLines: parseInt(maxLines, 10),
        };
    });

    const batchPrompt = `
        Please act as a JSON generation service. Based on the following context, generate the text for each of the prompt IDs listed below.
        
        Context:
        \`\`\`
        ${context}
        \`\`\`

        For each prompt, adhere to its specific system instruction and generate text with a maximum of ${"{{maxLines}}"} lines.
        Respond with a single, valid JSON object with keys corresponding to the prompt IDs. Do not include any other text or explanations in your response.

        Prompts to generate:
        ${prompts.map(p => `- ID: "${p.id}", System Instruction: "${p.system}", Prompt: "${p.prompt}", Max Lines: ${p.maxLines}`).join('\n')}
    `;
    
    try {
        let aiResultText: string;
        const modelStr = typeof model === 'string' ? model : (model as any).name;


        if (modelStr.startsWith('gpt-')) {
            aiResultText = await generateWithOpenAI(modelStr, "You are a JSON generation service. Respond only with valid JSON.", batchPrompt);
        } else {
             const aiResult = await generateText({
                model: model,
                prompt: batchPrompt,
                systemInstruction: "You are a JSON generation service. Respond only with valid JSON.",
            });
            aiResultText = aiResult.generatedText;
        }

        // Clean the AI response by removing markdown code fences before parsing
        const cleanedJson = aiResultText.replace(/^```json\n|```$/g, '');
        const parsedResult = JSON.parse(cleanedJson);


        // Replace all tags in the template with their corresponding results
        matches.forEach((match, index) => {
            const promptId = `output_${index}`;
            const replacement = parsedResult[promptId] || `[AI Generation Failed for prompt: ${prompts[index].prompt}]`;
            processedTemplate = processedTemplate.replace(match[0], replacement);
        });

    } catch (error) {
        console.error("Error during batch AI processing:", error);
        const errorMessage = `[AI Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}]`;
        // Replace all AI tags with a single error message
        processedTemplate = template.replace(aiTagRegex, errorMessage);
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
    userId: formData.get('userId'),
    model: formData.get('model'),
  });

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('. ');
    return {
      success: false,
      message: `Invalid form data: ${errorMessages}. Please check your inputs.`,
    };
  }
  
  const { name, description, project, number, userId, model } = validatedFields.data;

  if (!userId) {
    return {
        success: false,
        message: 'User not authenticated.',
    };
  }

  try {
    const projects = await getProjectCodes(userId);
    const projectInfo = projects.find((p) => p.name === project);

    if (!projectInfo || !projectInfo.id) {
      return {
        success: false,
        message: `Could not find a valid project for "${project}".`,
      };
    }
    
    const fullProject = await getProjectCode(projectInfo.id);
    const template = fullProject?.template || description; 
    
    const selectedModel = model;
    const finalDescription = await processTemplateWithAI(template, description, selectedModel);

    const projectKey = projectInfo.code;
    
    const allTaskCodes = await getTaskCodes(userId);

    const relevantTasks = allTaskCodes.filter(task => 
      task.status === 'active' &&
      (!task.projectIds || task.projectIds.length === 0 || task.projectIds.includes(projectInfo.id))
    );

    // Sanitize tasks for serialization before sending to the client
    const sanitizedTasks: TaskCode[] = relevantTasks.map(task => ({
        id: task.id,
        userId: task.userId,
        code: task.code,
        name: task.name,
        type: task.type,
        iconUrl: task.iconUrl || '',
        status: task.status,
        projectIds: task.projectIds || [],
        template: task.template || '',
    }));


    return {
      success: true,
      message: 'Content ready for Jira.',
      data: {
        storyDescription: finalDescription, 
        storyName: name,
        projectKey: projectKey,
        storyNumber: number,
        tasks: sanitizedTasks,
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
  aiContext: z.string(),
  model: z.string(),
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
    tasks,
    aiContext,
    model,
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
    const storyPayload = {
      fields: {
        project: { key: projectKey },
        summary: storySummary,
        description: storyDescription,
        issuetype: { id: storyIssueTypeId },
      },
    };

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
    
    const selectedModel = model;

    for (const subtask of tasks) {
      const subtaskSummary = `${projectKey}_${storyNumber}_${subtask.type} ${subtask.name}`;
      let subtaskDescription = '';

      if (subtask.template) {
        subtaskDescription = await processTemplateWithAI(subtask.template, aiContext, selectedModel);
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
