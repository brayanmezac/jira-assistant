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
          // The `parse` method will apply the .default() values for any missing fields.
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

  const setSettings = useCallback(async (newSettings: JiraSettings) => {
    if (!user) {
        console.error("Cannot save settings, no user is authenticated.");
        return;
    }

    try {
      // The incoming newSettings object from the form should be complete.
      // We parse it to ensure all defaults are applied and it's valid.
      const validatedSettings = jiraSettingsSchema.parse(newSettings);
      
      // Persist to Firestore
      await updateUserSettings(user.uid, validatedSettings);

      // Update the local state only after successful save
      setSettingsState(validatedSettings);

    } catch (error) {
      console.error("Failed to save settings to Firestore", error);
       if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
      }
    }
  }, [user]);

  return { settings, setSettings, loading };
}
