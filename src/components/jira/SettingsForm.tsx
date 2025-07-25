
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useSettings } from '@/hooks/use-settings';
import { useEffect, useState } from 'react';
import { getJiraIssueTypes } from '@/app/actions';
import type { JiraApiIssueType } from '@/lib/types';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { jiraSettingsSchema } from '@/lib/types';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';

const translations = {
    en: {
        jiraConnection: 'Jira Connection',
        jiraUrl: 'Jira URL',
        jiraUrlPlaceholder: 'https://your-domain.atlassian.net',
        jiraEmail: 'Jira User Email',
        jiraEmailPlaceholder: 'you@example.com',
        jiraToken: 'Jira API Token',
        jiraTokenPlaceholder: '••••••••••••••••••••',
        jiraTokenDescription: 'Your API token is used to create tickets on your behalf.',
        issueTypeMapping: 'Issue Type Mapping',
        issueTypeDescription: 'Select the correct issue types for Epics and Stories from your Jira instance. These are required to create tickets.',
        epicIssueType: 'Epic Issue Type',
        epicPlaceholder: 'Select an Epic issue type',
        storyIssueType: 'Story Issue Type',
        storyPlaceholder: 'Select a Story issue type',
        loadingTypes: 'Loading types...',
        appearance: 'Appearance',
        language: 'Language',
        languagePlaceholder: 'Select a language',
        theme: 'Theme',
        themePlaceholder: 'Select a theme',
        themeDescription: "The System theme will match your browser's preference.",
        saveButton: 'Save Settings',
        saveSuccessTitle: '✅ Settings Saved',
        saveSuccessDescription: 'Your Jira configuration has been saved to your account.',
        fetchTypesErrorTitle: 'Failed to fetch issue types',
        fetchTypesErrorDescription: 'Could not load issue types from Jira. Check connection details.',
    },
    es: {
        jiraConnection: 'Conexión Jira',
        jiraUrl: 'URL de Jira',
        jiraUrlPlaceholder: 'https://tu-dominio.atlassian.net',
        jiraEmail: 'Email de Usuario de Jira',
        jiraEmailPlaceholder: 'tu@ejemplo.com',
        jiraToken: 'Token de API de Jira',
        jiraTokenPlaceholder: '••••••••••••••••••••',
        jiraTokenDescription: 'Tu token de API se utiliza para crear tickets en tu nombre.',
        issueTypeMapping: 'Mapeo de Tipos de Incidencia',
        issueTypeDescription: 'Selecciona los tipos de incidencia correctos para Epics e Historias desde tu instancia de Jira. Son necesarios para crear tickets.',
        epicIssueType: 'Tipo de Incidencia para Epic',
        epicPlaceholder: 'Selecciona un tipo de Epic',
        storyIssueType: 'Tipo de Incidencia para Historia',
        storyPlaceholder: 'Selecciona un tipo de Historia',
        loadingTypes: 'Cargando tipos...',
        appearance: 'Apariencia',
        language: 'Idioma',
        languagePlaceholder: 'Selecciona un idioma',
        theme: 'Tema',
        themePlaceholder: 'Selecciona un tema',
        themeDescription: 'El tema del Sistema coincidirá con la preferencia de tu navegador.',
        saveButton: 'Guardar Configuración',
        saveSuccessTitle: '✅ Configuración Guardada',
        saveSuccessDescription: 'Tu configuración de Jira ha sido guardada en tu cuenta.',
        fetchTypesErrorTitle: 'Fallo al obtener tipos de incidencia',
        fetchTypesErrorDescription: 'No se pudieron cargar los tipos de incidencia desde Jira. Revisa los detalles de conexión.',
    }
};

function SettingsFormSkeleton() {
    return (
        <div className="space-y-6 max-w-lg">
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Separator />
             <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
    )
}


export function SettingsForm() {
  const { settings, setSettings, loading: isLoadingSettings } = useSettings();
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [issueTypes, setIssueTypes] = useState<JiraApiIssueType[]>([]);
  const [loadingIssueTypes, setLoadingIssueTypes] = useState(false);
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  const form = useForm<z.infer<typeof jiraSettingsSchema>>({
    resolver: zodResolver(jiraSettingsSchema),
    defaultValues: settings,
  });

  // Effect to sync form state when settings are loaded from DB
  useEffect(() => {
    if (!isLoadingSettings) {
      form.reset(settings);
      // Also apply the loaded theme
      setTheme(settings.theme || 'system');
    }
  }, [settings, isLoadingSettings, form, setTheme]);

  // Effect to fetch Jira issue types when connection details change and are valid
  useEffect(() => {
    const fetchIssueTypes = async () => {
      // Only fetch if we have the necessary details
      if (settings.url && settings.email && settings.token) {
        setLoadingIssueTypes(true);
        const result = await getJiraIssueTypes(settings);
        if (result.success && result.issueTypes) {
          setIssueTypes(result.issueTypes);
        } else if (!result.success) {
          // Don't toast on initial load if fields are just empty
          if(settings.url && settings.email && settings.token) {
             toast({
                variant: 'destructive',
                title: t.fetchTypesErrorTitle,
                description: result.message || t.fetchTypesErrorDescription,
             });
          }
        }
        setLoadingIssueTypes(false);
      } else {
        // Clear issue types if settings are incomplete
        setIssueTypes([]);
      }
    };
    // We run this effect whenever settings change, as it depends on them
    fetchIssueTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, toast]);


  const onSubmit = async (values: z.infer<typeof jiraSettingsSchema>) => {
    await setSettings(values);
    // Apply the theme immediately upon saving
    setTheme(values.theme);
    toast({
      title: t.saveSuccessTitle,
      description: t.saveSuccessDescription,
    });
  };

  if (isLoadingSettings) {
    return <SettingsFormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-lg"
      >
        <div className="space-y-2">
            <h3 className="text-lg font-medium">{t.jiraConnection}</h3>
        </div>
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.jiraUrl}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t.jiraUrlPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.jiraEmail}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t.jiraEmailPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.jiraToken}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t.jiraTokenPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t.jiraTokenDescription}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
         <div className="space-y-2">
            <h3 className="text-lg font-medium">{t.issueTypeMapping}</h3>
            <p className="text-sm text-muted-foreground">
                {t.issueTypeDescription}
            </p>
         </div>
        <FormField
          control={form.control}
          name="epicIssueTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.epicIssueType}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingIssueTypes}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingIssueTypes ? t.loadingTypes : t.epicPlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {issueTypes
                    .filter((it) => it.hierarchyLevel === 1)
                    .map((it) => (
                      <SelectItem key={it.id} value={it.id}>
                        {it.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storyIssueTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.storyIssueType}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingIssueTypes}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingIssueTypes ? t.loadingTypes : t.storyPlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {issueTypes
                    .filter((it) => it.hierarchyLevel === 0)
                    .map((it) => (
                      <SelectItem key={it.id} value={it.id}>
                        {it.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
         <div className="space-y-2">
            <h3 className="text-lg font-medium">{t.appearance}</h3>
         </div>
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.language}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.languagePlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.theme}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.themePlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t.themeDescription}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.saveButton}
        </Button>
      </form>
    </Form>
  );
}
