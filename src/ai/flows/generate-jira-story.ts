'use server';
/**
 * @fileOverview A Jira content generation AI agent.
 *
 * - generateJiraContent - A function that handles the Jira content generation process.
 * - GenerateJiraContentInput - The input type for the generateJiraContent function.
 * - GenerateJiraContentOutput - The return type for the generateJiraContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJiraContentInputSchema = z.object({
  storyDescription: z.string().describe('A description of the feature for which to create a Jira story.'),
  storyName: z.string().describe('The name of the Jira story.'),
  projectCode: z.string().describe('The code of the project.'),
  numero: z.number().describe('The number of the story.'),
});
export type GenerateJiraContentInput = z.infer<typeof GenerateJiraContentInputSchema>;

const GenerateJiraContentOutputSchema = z.object({
  epicDescription: z
    .string()
    .describe('The generated Jira epic description with technical details and acceptance criteria.'),
  storyDescription: z.string().describe('The generated Jira story for development.'),
});
export type GenerateJiraContentOutput = z.infer<typeof GenerateJiraContentOutputSchema>;

export async function generateJiraContent(input: GenerateJiraContentInput): Promise<GenerateJiraContentOutput> {
  return generateJiraContentFlow(input);
}

const epicPrompt = ai.definePrompt({
  name: 'generateJiraEpicPrompt',
  input: {schema: GenerateJiraContentInputSchema},
  output: {schema: z.object({ epicDescription: z.string() })},
  prompt: `Actúa como un analista técnico especializado en desarrollo con GeneXus y gestión de historias en JIRA.

Vas a recibir un texto desordenado proveniente de una reunión con el cliente o de apuntes técnicos. Tu tarea es estructurarlo como una *historia principal (epic)* en formato enriquecido para JIRA, con la más alta claridad, especificidad técnica y calidad descriptiva.

El formato debe ser el siguiente (usando sintaxis enriquecida de JIRA):

h2. *Datos de la KB*

* *Nombre:* {{{projectCode}}}_{{{numero}}}
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

Utiliza bullets (-_ y subtítulos (*A)_, _*B)_, etc.) si es necesario para mayor claridad.

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
{{{storyDescription}}}

Genera la historia como si fuera a servir de base para dividirse en varias subtareas de desarrollo.
`,
});

const storyPrompt = ai.definePrompt({
  name: 'generateJiraStoryPrompt',
  input: {schema: GenerateJiraContentInputSchema},
  output: {schema: z.object({ storyDescription: z.string() })},
  prompt: `Actúa como un analista técnico con experiencia en desarrollo GeneXus.

A continuación recibirás un texto con información recopilada de una reunión con el cliente y/o apuntes del analista, posiblemente desordenados. A partir de este contenido, genera una historia técnica estructurada para desarrollo siguiendo este formato:

**Desarrollo**

1. **Objetivo**: Explica claramente qué se requiere lograr con este desarrollo. Sé directo y técnico, evitando ambigüedades.

2. **Desarrollo a realizar**: Describe paso a paso lo que se debe desarrollar. Incluye:
   - Cambios a estructuras, tablas o transacciones.
   - Creación de nuevos procedimientos o componentes.
   - Parámetros que recibirá el desarrollo.
   - Flujos de validación y navegación de tablas.
   - Nombres de campos, estructuras, ejemplos de nombres de archivos, etc.

Usa nombres concretos si se mencionan en el contenido.

---

**Consideraciones**  
Incluye validaciones importantes, supuestos técnicos, restricciones, sobrescrituras, o cualquier punto que el desarrollador debe tener en cuenta para que el desarrollo funcione correctamente.

---

Contenido base a estructurar:

´´´´
{{{storyDescription}}}
´´´´

Transforma este contenido en una historia técnica clara, completa y bien redactada para su uso inmediato por el equipo de desarrollo.
`,
});


const generateJiraContentFlow = ai.defineFlow(
  {
    name: 'generateJiraContentFlow',
    inputSchema: GenerateJiraContentInputSchema,
    outputSchema: GenerateJiraContentOutputSchema,
  },
  async input => {
    const [epicResult, storyResult] = await Promise.all([
        epicPrompt(input),
        storyPrompt(input)
    ]);
    
    return {
        epicDescription: epicResult.output?.epicDescription || '',
        storyDescription: storyResult.output?.storyDescription || '',
    }
  }
);
