'use server';

/**
 * @fileOverview Jira story generation flow.
 *
 * - generateJiraStory - A function that generates a Jira story.
 * - GenerateJiraStoryInput - The input type for the generateJiraStory function.
 * - GenerateJiraStoryOutput - The return type for the generateJiraStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJiraStoryInputSchema = z.object({
  storyDescription: z.string().describe('A description of the feature for which to create a Jira story.'),
  storyName: z.string().describe('The name of the Jira story.'),
  projectName: z.string().describe('The name of the project.'),
  numero: z.number().describe('The number of the story.'),
});

export type GenerateJiraStoryInput = z.infer<typeof GenerateJiraStoryInputSchema>;

const GenerateJiraStoryOutputSchema = z.object({
  jiraStory: z.string().describe('The generated Jira story.'),
});

export type GenerateJiraStoryOutput = z.infer<typeof GenerateJiraStoryOutputSchema>;

export async function generateJiraStory(input: GenerateJiraStoryInput): Promise<GenerateJiraStoryOutput> {
  return generateJiraStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJiraStoryPrompt',
  input: {schema: GenerateJiraStoryInputSchema},
  output: {schema: GenerateJiraStoryOutputSchema},
  prompt: `You are an expert technical analyst specializing in creating Jira stories.

Based on the following information, generate a well-structured Jira story with technical details, development steps, and key considerations.

Project Name: {{{projectName}}}
Story Name: {{{storyName}}}
Story Number: {{{numero}}}
Story Description: {{{storyDescription}}}

The Jira story should include the following sections:

*   Objective: Explain the purpose of the story from a user perspective.
*   Analysis: Detail the scope of the story.
*   Development Steps: List the steps required to complete the story.
*   Considerations: Include important validations, technical rules, restrictions, and acceptance criteria.

Use Jira-flavored Markdown for formatting.
`,
});

const generateJiraStoryFlow = ai.defineFlow(
  {
    name: 'generateJiraStoryFlow',
    inputSchema: GenerateJiraStoryInputSchema,
    outputSchema: GenerateJiraStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      jiraStory: output!.jiraStory,
    };
  }
);
