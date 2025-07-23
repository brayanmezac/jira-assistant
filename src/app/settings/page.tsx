import { SettingsForm } from '@/components/jira/SettingsForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
       <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your Jira connection details.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Jira Configuration</CardTitle>
          <CardDescription>Enter your Jira API credentials here. This information is saved locally in your browser and is not sent to our servers.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
