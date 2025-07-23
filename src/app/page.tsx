import { JiraGenerator } from '@/components/jira/JiraGenerator';

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Jira Assist
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate Jira epics, stories, and subtasks automatically using AI.
        </p>
      </header>
      <JiraGenerator />
    </div>
  );
}
