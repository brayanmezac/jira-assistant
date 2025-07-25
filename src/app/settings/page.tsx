
'use client';

import { SettingsForm } from '@/components/jira/SettingsForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';

const translations = {
  en: {
    title: 'Settings',
    description: 'Configure your Jira connection details.',
    cardTitle: 'Jira Configuration',
    cardDescription: 'Enter your Jira API credentials here. This information is saved locally in your browser and is not sent to our servers.',
  },
  es: {
    title: 'Configuración',
    description: 'Configura los detalles de tu conexión a Jira.',
    cardTitle: 'Configuración de Jira',
    cardDescription: 'Introduce tus credenciales de la API de Jira aquí. Esta información se guarda localmente en tu navegador y no se envía a nuestros servidores.',
  }
}

export default function SettingsPage() {
  const { settings } = useSettings();
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  return (
    <div className="flex flex-col gap-8">
       <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.description}
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>{t.cardTitle}</CardTitle>
          <CardDescription>{t.cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
