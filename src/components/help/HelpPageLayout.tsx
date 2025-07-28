
'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useSettings } from '@/hooks/use-settings';

const translations = {
    en: {
        back: 'Back to Help',
    },
    es: {
        back: 'Volver a Ayuda',
    }
}

export function HelpPageLayout({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    const { settings } = useSettings();
    const t = translations[settings.language as keyof typeof translations] || translations.en;
    
    return (
        <div className="flex flex-col gap-8">
            <header className="relative">
                <Button variant="outline" size="sm" className="absolute -top-1 right-0" asChild>
                    <Link href="/help">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t.back}
                    </Link>
                </Button>
                <h1 className="text-3xl font-headline font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground mt-1 max-w-3xl">{description}</p>
            </header>

            <div className="prose prose-sm dark:prose-invert max-w-none">
                {children}
            </div>
        </div>
    );
}
