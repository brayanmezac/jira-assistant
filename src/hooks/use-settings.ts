'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { jiraSettingsSchema, type JiraSettings } from '@/lib/types';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserSettings, updateUserSettings } from '@/lib/firebase';

const defaultSettings: JiraSettings = {
    url: '',
    email: '',
    token: '',
    epicIssueTypeId: '',
    storyIssueTypeId: '',
    language: 'en',
    theme: 'system',
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettingsState] = useState<JiraSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Effect to load settings from Firestore when user is available
  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    let isMounted = true;
    
    async function loadSettings() {
      setLoading(true);
      try {
        const dbSettings = await getUserSettings(user!.uid);
        if (isMounted) {
          // Validate and merge with defaults to ensure all fields are present
          const validatedSettings = jiraSettingsSchema.parse(dbSettings || {});
          setSettingsState(validatedSettings);
        }
      } catch (error) {
        console.error("Failed to load or parse settings from Firestore:", error);
        if (isMounted) {
            setSettingsState(defaultSettings); // Fallback to defaults on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
        isMounted = false;
    }

  }, [user]);

  const setSettings = useCallback(async (newSettings: Partial<JiraSettings>) => {
    if (!user) {
        console.error("Cannot save settings, no user is authenticated.");
        return;
    }

    try {
      // Merge with existing settings to ensure we don't wipe fields
      const settingsToSave = { ...settings, ...newSettings };
      
      const validatedSettings = jiraSettingsSchema.parse(settingsToSave);
      
      await updateUserSettings(user.uid, validatedSettings);

      setSettingsState(validatedSettings);

    } catch (error) {
      console.error("Failed to save settings to Firestore", error);
       if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
      }
    }
  }, [user, settings]);

  return { settings, setSettings, loading };
}
