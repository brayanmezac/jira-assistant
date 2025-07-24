'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { jiraSettingsSchema } from '@/lib/types';

type JiraSettings = z.infer<typeof jiraSettingsSchema>;

const SETTINGS_KEY = 'jiraAssist.settings';

const initialSettings: JiraSettings = {
    url: '',
    email: '',
    token: '',
    epicIssueTypeId: '',
    storyIssueTypeId: '',
};

export function useSettings() {
  const [settings, setSettingsState] = useState<JiraSettings>(initialSettings);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(SETTINGS_KEY);
      if (item) {
        // Use safeParse to avoid throwing errors on invalid data
        const parsedSettings = jiraSettingsSchema.safeParse(JSON.parse(item));
        if (parsedSettings.success) {
            // Merge with initial settings to ensure all keys are present
            setSettingsState({ ...initialSettings, ...parsedSettings.data });
        } else {
            // If parsing fails, maybe clear the invalid data
            window.localStorage.removeItem(SETTINGS_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to parse settings from localStorage', error);
      // Clear potentially corrupted data
      window.localStorage.removeItem(SETTINGS_KEY);
    }
  }, []);

  const setSettings = useCallback((newSettings: JiraSettings) => {
    try {
      // Use parse to enforce the schema and get default values
      const validatedSettings = jiraSettingsSchema.parse(newSettings);
      
      // Update the state with the validated object
      setSettingsState(validatedSettings);

      // Save the validated object to localStorage
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(validatedSettings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
      }
    }
  }, []);

  return { settings, setSettings };
}
