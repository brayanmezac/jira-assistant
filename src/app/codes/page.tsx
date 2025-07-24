import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function CodesPage() {
  return (
    <div className="flex flex-col gap-8">
       <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Code Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your project and task codes here.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Here you will be able to configure your project and task codes.</p>
        </CardContent>
      </Card>
    </div>
  );
}
