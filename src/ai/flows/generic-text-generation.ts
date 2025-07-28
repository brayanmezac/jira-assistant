'use server';
/**
 * @fileOverview Generic AI text generation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ModelReference } from 'genkit/model';

const GenericTextGenerationInputSchema = z.object({
  model: z.any().describe('The AI model to use for generation.'), // Using z.any() as ModelReference is complex
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
      model: input.model as ModelReference, // Cast to the correct type
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
        
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check for specific quota-related error messages from the Google AI API
        if (errorMessage.includes('429') || /quota|resource exhausted/i.test(errorMessage)) {
            throw new Error("Has excedido tu cuota actual, por favor revisa tu plan y detalles de facturación.");
        }

        // For other errors, throw a generic but informative error
        throw new Error(`AI generation failed. Details: ${errorMessage}`);
    }
}
