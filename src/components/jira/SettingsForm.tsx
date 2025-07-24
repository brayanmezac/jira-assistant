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
  const { toast } = useToast();
  const [issueTypes, setIssueTypes] = useState<JiraApiIssueType[]>([]);
  const [loadingIssueTypes, setLoadingIssueTypes] = useState(false);

  const form = useForm<z.infer<typeof jiraSettingsSchema>>({
    resolver: zodResolver(jiraSettingsSchema),
    defaultValues: settings,
  });

  // Effect to sync form state when settings are loaded from DB
  useEffect(() => {
    if (!isLoadingSettings) {
      form.reset(settings);
    }
  }, [settings, isLoadingSettings, form]);

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
                title: 'Failed to fetch issue types',
                description: result.message || 'Could not load issue types from Jira. Check connection details.',
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
  }, [settings, toast]);


  const onSubmit = async (values: z.infer<typeof jiraSettingsSchema>) => {
    await setSettings(values);
    toast({
      title: '✅ Settings Saved',
      description: 'Your Jira configuration has been saved to your account.',
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
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jira URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://your-domain.atlassian.net"
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
              <FormLabel>Jira User Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@scitech.com.co" {...field} />
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
              <FormLabel>Jira API Token</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••••••••••••••"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your API token is used to create tickets on your behalf.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
         <div className="space-y-2">
            <h3 className="text-lg font-medium">Issue Type Mapping</h3>
            <p className="text-sm text-muted-foreground">
                Select the correct issue types for Epics and Stories from your Jira instance. These are required to create tickets.
            </p>
         </div>
        <FormField
          control={form.control}
          name="epicIssueTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Epic Issue Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingIssueTypes}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingIssueTypes ? "Loading types..." : "Select an Epic issue type"} />
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
              <FormLabel>Story Issue Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingIssueTypes}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingIssueTypes ? "Loading types..." : "Select a Story issue type"} />
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
        </Button>
      </form>
    </Form>
  );
}
