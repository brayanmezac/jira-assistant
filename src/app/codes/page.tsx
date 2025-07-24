import { ProjectCodes } from '@/components/codes/ProjectCodes';
import { TaskCodes } from '@/components/codes/TaskCodes';
import { getProjectCodes, getTaskCodes } from '@/lib/firebase';

export default async function CodesPage() {
  const [projects, tasks] = await Promise.all([
    getProjectCodes(),
    getTaskCodes(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Code Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your project and task codes for Jira ticket generation.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProjectCodes initialProjects={projects}/>
        <TaskCodes initialTasks={tasks} />
      </div>
    </div>
  );
}
