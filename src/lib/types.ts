import { z } from 'zod';

export const jiraStoryFormSchema = z.object({
  name: z.string().min(3, { message: 'Story name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  number: z.coerce.number().int().positive({ message: 'Story number must be a positive number.' }),
  project: z.string().nonempty({ message: 'Please select a project.' }),
});

export const jiraSettingsSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  email: z.string().email({ message: 'Please enter a valid email.' }).optional().or(z.literal('')),
  token: z.string().optional(),
});
