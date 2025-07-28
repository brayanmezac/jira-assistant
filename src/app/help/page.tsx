
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Book, Cpu, Wrench } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

const translations = {
    en: {
        title: 'Help & Documentation',
        description: 'Find guides and information on how to use Jira Assist effectively.',
        searchPlaceholder: 'Search documentation...',
        // Articles
        jiraSyntaxTitle: 'Jira Text Formatting',
        jiraSyntaxDescription: 'Learn how to format text using Jira\'s wiki markup.',
        aiTagTitle: 'Using the <AI/> Tag',
        aiTagDescription: 'Discover how to dynamically generate content in your templates.',
        toolGuideTitle: 'General Tool Guide',
        toolGuideDescription: 'An overview of the application\'s features and workflow.',
        noResults: 'No results found.',
    },
    es: {
        title: 'Ayuda y Documentación',
        description: 'Encuentra guías e información sobre cómo usar Jira Assist de manera efectiva.',
        searchPlaceholder: 'Buscar en la documentación...',
        // Articles
        jiraSyntaxTitle: 'Formato de Texto de Jira',
        jiraSyntaxDescription: 'Aprende a formatear texto usando el lenguaje de marcado wiki de Jira.',
        aiTagTitle: 'Uso de la Etiqueta <AI/>',
        aiTagDescription: 'Descubre cómo generar contenido dinámicamente en tus plantillas.',
        toolGuideTitle: 'Guía General de la Herramienta',
        toolGuideDescription: 'Un resumen de las características y el flujo de trabajo de la aplicación.',
        noResults: 'No se encontraron resultados.',
    }
};

const helpArticles = [
  {
    href: '/help/jira-syntax',
    icon: Book,
    translationKey: 'jiraSyntax'
  },
  {
    href: '/help/ai-tag',
    icon: Cpu,
    translationKey: 'aiTag'
  },
  {
    href: '/help/tool-guide',
    icon: Wrench,
    translationKey: 'toolGuide'
  },
] as const;


export default function HelpPage() {
    const { settings } = useSettings();
    const t = translations[settings.language as keyof typeof translations] || translations.en;
    const [searchTerm, setSearchTerm] = useState('');
    
    const articles = helpArticles.map(article => ({
        ...article,
        title: t[`${article.translationKey}Title` as keyof typeof t],
        description: t[`${article.translationKey}Description` as keyof typeof t],
    }));

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-headline font-bold tracking-tight">{t.title}</h1>
                <p className="text-muted-foreground mt-1">{t.description}</p>
            </header>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t.searchPlaceholder}
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                        <Link href={article.href} key={article.href} className="group">
                            <Card className="h-full transition-all group-hover:border-primary group-hover:shadow-md">
                                <CardHeader className="flex-row items-center gap-4 space-y-0">
                                    <article.icon className="h-8 w-8 text-primary" />
                                    <div>
                                        <CardTitle>{article.title}</CardTitle>
                                        <CardDescription className="mt-1">{article.description}</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <p className="text-muted-foreground col-span-full text-center">{t.noResults}</p>
                )}
            </div>
        </div>
    );
}
