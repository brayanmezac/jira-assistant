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
  prompt: `Actúa como un analista técnico especializado en desarrollo con GeneXus y gestión de historias en JIRA.

Vas a recibir una descripción de una historia de alto nivel. Tu tarea es estructurarla como una *historia principal (epic)* en formato enriquecido para JIRA, con la más alta claridad, especificidad técnica y calidad descriptiva.

El formato debe ser el siguiente (usando sintaxis enriquecida de JIRA):

h2. *Datos de la KB*

* *Nombre:* {{{storyName}}}
* *Genexus:* GX 17 U13
* *Info:* [Datos KB](https://link.com)

***

h2. *Desarrollo*

* *1. Objetivo:* 
Escribe el objetivo funcional de la historia desde la perspectiva del usuario y lo que se busca lograr. Usa el formato "Como... Quiero... Para..." si aplica.

* *2. Desarrollo a realizar:* 
Estructura los puntos principales como pasos detallados y numerados. Incluye:

- Procesos que se deben implementar o actualizar.
- Pantallas que se deben modificar (con nombre técnico y ruta si se menciona).
- Validaciones a realizar.
- Nombres de procedimientos, estructuras o campos técnicos.
- Cómo deben construirse las rutas y nombres de archivos.
- Comportamientos esperados en condiciones específicas (ej: cuándo sobrescribir, cuándo no ejecutar).

Utiliza bullets (

- 

) y subtítulos (*A), *B), etc.) si es necesario para mayor claridad.

* *3. Consideraciones:* 
Especifica todas las validaciones, reglas técnicas, restricciones, criterios de aceptación y condiciones especiales que el desarrollo debe cumplir.

Incluye:

- Validación de existencia de carpetas y comportamiento.
- Criterios de versión de documentos.
- Validaciones por tipo de documento.
- Comportamiento esperado de las pantallas según el estado.
- Procedimientos auxiliares que deben usarse o modificarse.

***

Contenido a estructurar:
{{{featureDescription}}}

Genera la historia como si fuera a servir de base para dividirse en varias subtareas de desarrollo.
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
