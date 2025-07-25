'use server';
/**
 * @fileOverview Generic AI text generation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenericTextGenerationInputSchema = z.object({
  prompt: z.string().describe('The main prompt or content for the AI to process.'),
  systemInstruction: z.string().optional().describe('A system-level instruction to guide the AI\'s behavior (e.g., "Act as a technical analyst").'),
  // Add other parameters like temperature, model, etc. if needed in the future
});
export type GenericTextGenerationInput = z.infer<typeof GenericTextGenerationInputSchema>;

const GenericTextGenerationOutputSchema = z.object({
  generatedText: z.string(),
});
export type GenericTextGenerationOutput = z.infer<typeof GenericTextGenerationOutputSchema>;

export const generateTextFlow = ai.defineFlow(
  {
    name: 'generateTextFlow',
    inputSchema: GenericTextGenerationInputSchema,
    outputSchema: GenericTextGenerationOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: input.prompt,
      system: input.systemInstruction,
    });
    
    return { generatedText: text };
  }
);

export async function generateText(input: GenericTextGenerationInput): Promise<GenericTextGenerationOutput> {
    try {
        const result = await generateTextFlow(input);
        return result;
    } catch (error) {
        console.error("Error in generateText flow:", error);
        // Ensure a structured error is thrown.
        throw new Error(`AI generation failed. Details: ${error instanceof Error ? error.message : String(error)}`);
    }
}
