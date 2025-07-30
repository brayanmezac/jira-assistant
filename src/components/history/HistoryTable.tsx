
'use client';

import type { GenerationHistoryEntry } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ExternalLink, Bot } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

const translations = {
    en: {
        title: 'Detailed History',
        description: 'A log of all the stories you have generated.',
        storyName: 'Story Name',
        date: 'Date',
        tasks: 'Tasks',
        aiUsed: 'AI',
        link: 'Link',
        view: 'View',
        yes: 'Yes',
        no: 'No',
    },
    es: {
        title: 'Historial Detallado',
        description: 'Un registro de todas las historias que has generado.',
        storyName: 'Nombre de la Historia',
        date: 'Fecha',
        tasks: 'Tareas',
        aiUsed: 'IA',
        link: 'Enlace',
        view: 'Ver',
        yes: 'Sí',
        no: 'No',
    }
}

export function HistoryTable({ history, jiraUrl }: { history: GenerationHistoryEntry[], jiraUrl: string }) {
    const { settings } = useSettings();
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    const formatDate = (timestamp: any) => {
        if (!timestamp?.seconds) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleString(settings.language, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.title}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-2/5'>{t.storyName}</TableHead>
                            <TableHead className='w-1/5'>{t.date}</TableHead>
                            <TableHead className='w-2/5'>{t.tasks}</TableHead>
                            <TableHead className='text-center'>{t.aiUsed}</TableHead>
                            <TableHead className='text-right'>{t.link}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map(entry => (
                            <TableRow key={entry.id}>
                                <TableCell className='font-medium'>{entry.storyName}</TableCell>
                                <TableCell className='text-muted-foreground'>{formatDate(entry.createdAt)}</TableCell>
                                <TableCell>
                                    <div className='flex flex-wrap gap-1'>
                                        {entry.tasks.map((task, index) => (
                                            <Badge key={index} variant="secondary">{task}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className='text-center'>
                                    {entry.aiUsed ? 
                                        <Badge variant='outline' className='text-green-500 border-green-500/50'><Bot className='mr-1'/>{entry.aiModel}</Badge> : 
                                        <Badge variant='destructive'>{t.no}</Badge>
                                    }
                                </TableCell>
                                <TableCell className='text-right'>
                                    {jiraUrl && entry.jiraLink && (
                                        <Button variant='outline' size='sm' asChild>
                                            <a href={entry.jiraLink} target="_blank" rel="noopener noreferrer">
                                                {t.view}
                                                <ExternalLink className='ml-2 h-3 w-3'/>
                                            </a>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                         {history.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No history records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

