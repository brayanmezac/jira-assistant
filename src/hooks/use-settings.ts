'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { jiraSettingsSchema } from '@/lib/types';

type JiraSettings = z.infer<typeof jiraSettingsSchema>;

const SETTINGS_KEY = 'jiraAssist.settings';

// This is the true default, ensuring all keys are present.
const defaultSettings: JiraSettings = {
    url: '',
    email: '',
    token: '',
    epicIssueTypeId: '',
    storyIssueTypeId: '',
};

export function useSettings() {
  const [settings, setSettingsState] = useState<JiraSettings>(defaultSettings);

  // On component mount, try to load settings from localStorage.
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(SETTINGS_KEY);
      if (item) {
        // Parse the stored data and merge it with defaults to ensure
        // all keys are present, even if the stored data is from an older version.
        const parsedSettings = jiraSettingsSchema.parse(JSON.parse(item));
        setSettingsState(parsedSettings);
      }
    } catch (error) {
      console.error('Failed to parse settings from localStorage, using defaults.', error);
      // If parsing fails, it's safer to clear the corrupted data.
      window.localStorage.removeItem(SETTINGS_KEY);
    }
  }, []);

  const setSettings = useCallback((newSettings: Partial<JiraSettings>) => {
    try {
      // Create a new object by merging the existing state with the new values.
      const mergedSettings = { ...settings, ...newSettings };
      
      // Validate the merged object to ensure it conforms to the schema.
      const validatedSettings = jiraSettingsSchema.parse(mergedSettings);

      // Update the React state with the complete, validated object.
      setSettingsState(validatedSettings);

      // Save the complete, validated object to localStorage.
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(validatedSettings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
      }
    }
  }, [settings]); // Depend on `settings` to ensure `mergedSettings` is up-to-date.

  return { settings, setSettings };
}