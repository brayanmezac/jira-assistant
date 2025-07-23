'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { jiraSettingsSchema } from '@/lib/types';

type JiraSettings = z.infer<typeof jiraSettingsSchema>;

const SETTINGS_KEY = 'jiraAssist.settings';

export function useSettings() {
  const [settings, setSettingsState] = useState<JiraSettings>({
    url: '',
    email: '',
    token: '',
  });

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(SETTINGS_KEY);
      if (item) {
        const parsedSettings = jiraSettingsSchema.safeParse(JSON.parse(item));
        if (parsedSettings.success) {
            setSettingsState(parsedSettings.data);
        }
      }
    } catch (error) {
      console.error('Failed to parse settings from localStorage', error);
    }
  }, []);

  const setSettings = useCallback((newSettings: JiraSettings) => {
    try {
      const validatedSettings = jiraSettingsSchema.parse(newSettings);
      setSettingsState(validatedSettings);
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(validatedSettings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  }, []);

  return { settings, setSettings };
}
