import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openAI} from '@genkit-ai/openai';
import {config} from 'dotenv';

config();

// This file configures Genkit for the application.
// In a real app, you would configure plugins and other settings here.

const plugins = [];

if (process.env.GEMINI_API_KEY) {
    plugins.push(googleAI());
}

/*
if (process.env.OPENAI_API_KEY) {
    plugins.push(openAI({
        apiKey: process.env.OPENAI_API_KEY,
    }));
}
*/


export const ai = genkit({
  plugins,
});
