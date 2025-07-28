
'use client';

import { HelpPageLayout } from '@/components/help/HelpPageLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSettings } from '@/hooks/use-settings';

const translations = {
  en: {
    title: 'Jira Text Formatting Guide',
    description: 'Jira descriptions use a simple markup language called Wiki Markup. Here are some of the most common formatting options.',
    feature: 'Feature',
    markup: 'Markup',
    example: 'Example',
    headings: 'Headings',
    bold: 'Bold',
    italic: 'Italic',
    strikethrough: 'Strikethrough',
    underline: 'Underline',
    monospace: 'Monospaced Text',
    lineBreak: 'Line Break',
    link: 'Link',
    image: 'Image',
    bulletedList: 'Bulleted List',
    numberedList: 'Numbered List',
    table: 'Table',
    panel: 'Panel / Info Box',
    codeBlock: 'Code Block',
    quote: 'Quote Block',
    officialDocs: 'For a complete guide, please refer to the',
    officialDocsLinkText: 'official Atlassian documentation',
  },
  es: {
    title: 'Guía de Formato de Texto de Jira',
    description: 'Las descripciones de Jira utilizan un lenguaje de marcado simple llamado Wiki Markup. Aquí están algunas de las opciones de formato más comunes.',
    feature: 'Característica',
    markup: 'Sintaxis',
    example: 'Ejemplo',
    headings: 'Encabezados',
    bold: 'Negrita',
    italic: 'Cursiva',
    strikethrough: 'Tachado',
    underline: 'Subrayado',
    monospace: 'Texto Monoespaciado',
    lineBreak: 'Salto de Línea',
    link: 'Enlace',
    image: 'Imagen',
    bulletedList: 'Lista con Viñetas',
    numberedList: 'Lista Numerada',
    table: 'Tabla',
    panel: 'Panel / Caja de Información',
    codeBlock: 'Bloque de Código',
    quote: 'Bloque de Cita',
    officialDocs: 'Para una guía completa, por favor consulta la',
    officialDocsLinkText: 'documentación oficial de Atlassian',
  }
};

export default function JiraSyntaxHelpPage() {
    const { settings } = useSettings();
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    const formattingOptions = [
      { feature: t.headings, markup: 'h1. a h6.', example: 'h2. My Heading' },
      { feature: t.bold, markup: '*bold text*', example: '*some bold text*' },
      { feature: t.italic, markup: '_italic text_', example: '_some italicized text_' },
      { feature: t.strikethrough, markup: '-strikethrough-', example: '-this is struck out-' },
      { feature: t.underline, markup: '+underline+', example: '+underlined text+' },
      { feature: t.monospace, markup: '{{monospace}}', example: '{{const x = 10;}}' },
      { feature: t.lineBreak, markup: '\\\\', example: 'line 1\\\\line 2' },
      { feature: t.link, markup: '[text|url]', example: '[Google|http://google.com]' },
      { feature: t.image, markup: '!url!', example: '!https://placehold.co/100x50.png!' },
      { feature: t.bulletedList, markup: '* item\n* item', example: '* first\n* second' },
      { feature: t.numberedList, markup: '# item\n# item', example: '# first\n# second' },
      { feature: t.table, markup: '||heading||heading||\n|cell|cell|', example: '||H1||H2||\n|a|b|' },
      { feature: t.panel, markup: '{panel:title=...}\nbody\n{panel}', example: '{panel:title=Note}\nThis is a note.\n{panel}' },
      { feature: t.codeBlock, markup: '{code:language}\ncode\n{code}', example: '{code:js}\nvar x=1;\n{code}' },
      { feature: t.quote, markup: 'bq. quote', example: 'bq. This is a quote.' },
    ];


    return (
        <HelpPageLayout title={t.title} description={t.description}>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/4">{t.feature}</TableHead>
                            <TableHead className="w-1/4">{t.markup}</TableHead>
                            <TableHead className="w-1/2">{t.example}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {formattingOptions.map((opt) => (
                            <TableRow key={opt.feature}>
                                <TableCell className="font-medium">{opt.feature}</TableCell>
                                <TableCell>
                                    <code className="font-mono bg-muted p-1 rounded-sm text-sm">{opt.markup}</code>
                                </TableCell>
                                <TableCell>
                                    <code className="font-mono text-sm">{opt.example}</code>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
                {t.officialDocs}{' '}
                <a
                    href="https://jira.atlassian.com/secure/WikiRendererHelpAction.jspa?section=all"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                >
                    {t.officialDocsLinkText}
                </a>.
            </p>
        </HelpPageLayout>
    );
}
