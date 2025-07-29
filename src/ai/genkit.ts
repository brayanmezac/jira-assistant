import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

// This file configures Genkit for the application.
// In a real app, you would configure plugins and other settings here.

const plugins = [];

if (process.env.GEMINI_API_KEY) {
    plugins.push(googleAI());
}

export const ai = genkit({
  plugins,
});
