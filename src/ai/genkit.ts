import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This file configures Genkit for the application.
// In a real app, you would configure plugins and other settings here.

export const ai = genkit({
  // In a real app, you would configure plugins like this:
  // plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  // For now, we leave it empty to avoid authentication errors.
  plugins: [],
});

    