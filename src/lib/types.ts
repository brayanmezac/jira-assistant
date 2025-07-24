import { z } from 'zod';

export const jiraStoryFormSchema = z.object({
  name: z.string().min(3, { message: 'Story name must be at least 3 characters.' }),
  description: z.string(),
  number: z.coerce.number().int().positive({ message: 'Story number must be a positive number.' }),
  project: z.string().nonempty({ message: 'Please select a project.' }),
});

export const jiraSettingsSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  email: z.string().email({ message: 'Please enter a valid email.' }).optional().or(z.literal('')),
  token: z.string().optional().default(''),
  epicIssueTypeId: z.string().default(''),
  storyIssueTypeId: z.string().default(''),
});

export const projectCodeSchema = z.object({
  code: z.string().min(1, { message: 'Code is required.'}),
  name: z.string().min(1, { message: 'Name is required.'}),
});
export type ProjectCode = z.infer<typeof projectCodeSchema> & { id: string };


export const taskCodeSchema = z.object({
  code: z.string().min(1, { message: 'Code (ID) is required.' }),
  name: z.string().min(1, { message: 'Name is required.' }),
  type: z.string().min(1, { message: 'Type is required.' }),
  iconUrl: z.string().url().optional().or(z.literal('')),
});
export type TaskCode = z.infer<typeof taskCodeSchema> & { id: string };

export const jiraIssueTypeSchema = z.object({
    id: z.string(),
    name: z.string(),
    iconUrl: z.string().url(),
    hierarchyLevel: z.number(),
});
