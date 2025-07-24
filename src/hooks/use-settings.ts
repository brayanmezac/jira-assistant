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
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettingsState] = useState<JiraSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Effect to load settings from Firestore when user is available
  useEffect(() => {
    if (!user) {
        // If there's no user, we can stop loading and use defaults.
        // Or wait, but for now, let's stop.
        setLoading(false);
        return;
    };

    let isMounted = true;
    
    async function loadSettings() {
      setLoading(true);
      try {
        const dbSettings = await getUserSettings(user!.uid);
        if (isMounted) {
          if (dbSettings) {
            // Validate and merge with defaults to ensure all fields are present
            const validatedSettings = jiraSettingsSchema.parse({
                ...defaultSettings,
                ...dbSettings,
            });
            setSettingsState(validatedSettings);
          } else {
            // No settings in DB, use defaults
            setSettingsState(defaultSettings);
          }
        }
      } catch (error) {
        console.error("Failed to load settings from Firestore:", error);
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
      const mergedSettings = { ...settings, ...newSettings };
      const validatedSettings = jiraSettingsSchema.parse(mergedSettings);
      
      // Optimistically update the state
      setSettingsState(validatedSettings);

      // Persist to Firestore
      await updateUserSettings(user.uid, validatedSettings);

    } catch (error) {
      console.error("Failed to save settings to Firestore", error);
       if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
      }
    }
  }, [user, settings]);

  return { settings, setSettings, loading };
}
