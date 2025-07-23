'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useSettings } from '@/hooks/use-settings';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { jiraSettingsSchema } from '@/lib/types';

export function SettingsForm() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof jiraSettingsSchema>>({
    resolver: zodResolver(jiraSettingsSchema),
    values: settings,
  });

  const onSubmit = (values: z.infer<typeof jiraSettingsSchema>) => {
    setSettings(values);
    toast({
        title: '✅ Settings Saved',
        description: 'Your Jira configuration has been updated.',
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jira URL</FormLabel>
              <FormControl>
                <Input placeholder="https://your-domain.atlassian.net" {...field} />
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
                <Input type="email" placeholder="you@example.com" {...field} />
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
                <Input type="password" placeholder="••••••••••••••••••••" {...field} />
              </FormControl>
              <FormDescription>
                Your API token is used to create tickets on your behalf.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Settings</Button>
      </form>
    </Form>
  );
}
