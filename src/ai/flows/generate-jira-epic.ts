'use server';

/**
 * @fileOverview An AI agent for generating Jira epics with technical details and acceptance criteria.
 *
 * - generateJiraEpic - A function that handles the generation of Jira epics.
 * - GenerateJiraEpicInput - The input type for the generateJiraEpic function.
 * - GenerateJiraEpicOutput - The return type for the generateJiraEpic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJiraEpicInputSchema = z.object({
  featureDescription: z
    .string()
    .describe('A high-level description of the feature.'),
  projectName: z.string().describe('The name of the Jira project.'),
  storyName: z.string().describe('The name of the Jira story.'),
  numero: z.number().describe('The issue number'),
});
export type GenerateJiraEpicInput = z.infer<typeof GenerateJiraEpicInputSchema>;

const GenerateJiraEpicOutputSchema = z.object({
  epicDescription: z
    .string()
    .describe('The generated Jira epic description with technical details and acceptance criteria.'),
});
export type GenerateJiraEpicOutput = z.infer<typeof GenerateJiraEpicOutputSchema>;

export async function generateJiraEpic(input: GenerateJiraEpicInput): Promise<GenerateJiraEpicOutput> {
  return generateJiraEpicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJiraEpicPrompt',
  input: {schema: GenerateJiraEpicInputSchema},
  output: {schema: GenerateJiraEpicOutputSchema},
  prompt: `Actúa como un analista técnico experto en JIRA.
Tu tarea es crear una descripción para un Épico de JIRA a partir de la siguiente información.
La descripción debe estar bien estructurada, con detalles técnicos, y usar el formato enriquecido de JIRA (Jira-flavored markdown).

Feature: {{{storyName}}}
Project: {{{projectName}}}
Story Number: {{{numero}}}
Description:
{{{featureDescription}}}

Genera la descripción del épico con las siguientes secciones:
- h2. *Datos de la KB* (Con nombre, versión de Genexus, etc.)
- h2. *Desarrollo* (Con objetivo, pasos detallados, y consideraciones)

La descripción debe ser clara, completa y lista para que un equipo de desarrollo la utilice.
`,
});

const generateJiraEpicFlow = ai.defineFlow(
  {
    name: 'generateJiraEpicFlow',
    inputSchema: GenerateJiraEpicInputSchema,
    outputSchema: GenerateJiraEpicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
