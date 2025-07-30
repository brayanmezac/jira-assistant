
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const jiraStoryFormSchema = z.object({
  name: z.string().min(3, { message: 'Story name must be at least 3 characters.' }),
  description: z.string().nullish().default(''), // AI context can be null and will default to empty string
  number: z.coerce.number({required_error: "Story number is required."}).int().positive({ message: 'Story number must be a positive number.' }),
  project: z.string().nonempty({ message: 'Please select a project.' }),
  userId: z.string().nonempty({ message: 'User ID is required.' }),
  selectedTasks: z.array(z.string()).optional().default([]),
});

export const jiraSettingsSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')).default(''),
  email: z.string().email({ message: 'Please enter a valid email.' }).or(z.literal('')).default(''),
  token: z.string().optional().default(''),
  epicIssueTypeId: z.string().optional().default(''),
  storyIssueTypeId: z.string().optional().default(''),
  language: z.string().default('en'),
  theme: z.string().default('system'),
});
export type JiraSettings = z.infer<typeof jiraSettingsSchema>;

export const projectCodeSchema = z.object({
  userId: z.string(),
  code: z.string().min(1, { message: 'Code is required.'}),
  name: z.string().min(1, { message: 'Name is required.'}),
  template: z.string().optional(),
});
export type ProjectCode = z.infer<typeof projectCodeSchema> & { id: string };


export const taskCodeSchema = z.object({
  userId: z.string(),
  code: z.string().min(1, { message: 'Code (ID) is required.' }),
  name: z.string().min(1, { message: 'Name is required.' }),
  type: z.string().min(1, { message: 'Type is required.' }),
  iconUrl: z.string().url().or(z.literal('')).default(''),
  status: z.enum(['active', 'inactive', 'optional']).default('active'),
  projectIds: z.array(z.string()).optional().default([]), // Empty array means "General"
  template: z.string().optional(), // Added template field
  order: z.number().default(0),
});
export type TaskCode = z.infer<typeof taskCodeSchema> & { id: string };

export const jiraIssueTypeSchema = z.object({
    id: z.string(),
    name: z.string(),
    iconUrl: z.string().url(),
    hierarchyLevel: z.number(),
});

export const generationHistorySchema = z.object({
    userId: z.string(),
    createdAt: z.instanceof(Timestamp),
    storyName: z.string(),
    jiraLink: z.string().url(),
    tasks: z.array(z.string()),
    aiUsed: z.boolean(),
    aiModel: z.string().optional(),
    aiCost: z.number().optional(),
});
export type GenerationHistoryEntry = z.infer<typeof generationHistorySchema> & { id: string };
