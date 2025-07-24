
'use server';

import { z } from 'zod';
import {
  jiraStoryFormSchema,
  jiraSettingsSchema,
  jiraIssueTypeSchema,
} from '@/lib/types';
import { getTaskCodes, getProjectCodes } from '@/lib/firebase';

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
    const projects = await getProjectCodes();
    const projectInfo = projects.find((p) => p.name === project);

    if (!projectInfo || !projectInfo.code) {
      return {
        success: false,
        message: `Could not find a valid project code for "${project}". Please check your configuration in the 'Codes' page.`,
      };
    }

    const projectKey = projectInfo.code;
    console.log(
      `[PROJECT DEBUG] Using project key: "${projectKey}" for project name: "${project}"`
    );

    let epicDescription = '';
    let storyDescription = '';

    if (description) {
      epicDescription = description;
      storyDescription = description;
    } else {
      epicDescription = `Epic for: ${name}`;
      storyDescription = `Story for: ${name}`;
    }

    return {
      success: true,
      message: 'Successfully generated content.',
      data: {
        epic: epicDescription,
        story: storyDescription,
        storyName: name,
        projectKey: projectKey,
      },
    };
  } catch (error: any) {
    console.error('Error in generateJiraTicketsAction:', error);
    return {
      success: false,
      message: `An error occurred while generating the Jira tickets. Please try again. (Details: ${error.message})`,
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

export async function createJiraTickets(
  input: CreateJiraTicketsInput
): Promise<JiraResult> {
  console.log('[JIRA DEBUG] Received data for ticket creation:', {
    ...input,
    settings: { ...input.settings, token: 'REDACTED' },
  });

  const {
    epicSummary,
    epicDescription,
    storySummary,
    storyDescription,
    projectKey,
    settings,
  } = input;
  const { url, email, token, epicIssueTypeId, storyIssueTypeId } = settings;

  if (!url || !email || !token) {
    return {
      success: false,
      message: 'Jira connection settings are incomplete. Please check your settings.',
    };
  }
   if (!epicIssueTypeId || !storyIssueTypeId) {
    return {
        success: false,
        message: 'Epic or Story issue type is not configured in Settings. Please select them and save.'
    }
   }

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    const epicPayload = {
      fields: {
        project: { key: projectKey },
        summary: epicSummary,
        description: epicDescription,
        issuetype: { id: epicIssueTypeId },
        customfield_10011: epicSummary, // Note: This is often the "Epic Name" field
      },
    };

    console.log(
      '[JIRA DEBUG] Creating Epic with payload:',
      JSON.stringify(epicPayload, null, 2)
    );
    const epicResponse = await fetch(`${url}/rest/api/2/issue`, {
      method: 'POST',
      headers,
      body: JSON.stringify(epicPayload),
    });

    if (!epicResponse.ok) {
      const errorData = await epicResponse.text();
      console.error('[JIRA DEBUG] Failed to create Epic:', {
        status: epicResponse.status,
        statusText: epicResponse.statusText,
        data: errorData,
      });
      return {
        success: false,
        message: `Failed to create Epic: ${epicResponse.statusText}. ${errorData}`,
      };
    }

    const epicData = await epicResponse.json();
    const epicKey = epicData.key;
    console.log('[JIRA DEBUG] Epic created successfully:', epicData);

    const storyPayload = {
      fields: {
        project: { key: projectKey },
        summary: storySummary,
        description: storyDescription,
        issuetype: { id: storyIssueTypeId },
        customfield_10014: epicKey, // Note: This is often the "Epic Link" field
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

    const subtaskList = await getTaskCodes();
    console.log(`[JIRA DEBUG] Found ${subtaskList.length} sub-tasks to create.`);
    for (const subtask of subtaskList) {
      const subtaskPayload = {
        fields: {
          project: { key: projectKey },
          summary: subtask.name,
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
        // Decide if you want to stop or continue. For now, we continue.
      }
    }
    console.log('[JIRA DEBUG] Sub-task creation process finished.');

    return {
      success: true,
      message: 'Tickets created successfully!',
      data: { epicKey },
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
