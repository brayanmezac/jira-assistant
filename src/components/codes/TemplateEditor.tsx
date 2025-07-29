
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup'; // For Jira's markup-like syntax
import 'prismjs/themes/prism-okaidia.css'; // A popular dark theme
import Link from 'next/link';

// Custom language definition for Jira-like syntax + AI tag
Prism.languages['jira-ai-markup'] = {
  ...Prism.languages.markup,
  'ai-tag': {
    pattern: /<AI\s+[^>]*\/?>/,
    inside: {
      'tag': {
        pattern: /<\/?AI|\/?>/,
        inside: { 'punctuation': /<|\/|>/ }
      },
      'attr-name': /\b(prompt|system|maxLines)\b/,
      'attr-value': {
        pattern: /="[^"]*"/,
        inside: {
          'punctuation': [
            /^="/,
            /"$/
          ]
        }
      },
      'punctuation': /=/
    },
    greedy: true,
  },
  'heading': {
    pattern: /^h[1-6]\..*$/m,
    greedy: true,
  },
  'bold': {
    pattern: /\*.*?\*/,
    greedy: true,
  },
  'italic': {
    pattern: /_.*?_/,
    greedy: true,
  },
  'list': {
    pattern: /^[*\-#]+\s.*/m,
    greedy: true,
  },
};

const translations = {
    en: {
        templateTitle: 'Description Template',
        templateDescription: <>Create a template for the description. Use Jira's rich text format. You can use the <Link href="/help/ai-tag" className="text-primary underline">{'<AI/>'}</Link> tag to dynamically generate content.</>,
        editorTab: 'Editor',
        previewTab: 'Preview',
        templateContent: 'Template Content',
        templatePlaceholder: 'h2. Objective\n\n<AI prompt="Describe the objective of this story." system="Act as a technical writer." maxLines="5" />',
        saveTemplate: 'Save Template',
    },
    es: {
        templateTitle: 'Plantilla de Descripción',
        templateDescription: <>Crea una plantilla para la descripción. Usa el formato de texto enriquecido de Jira. Puedes usar la etiqueta <Link href="/help/ai-tag" className="text-primary underline">{'<AI/>'}</Link> para generar contenido dinámicamente.</>,
        editorTab: 'Editor',
        previewTab: 'Vista Previa',
        templateContent: 'Contenido de la Plantilla',
        templatePlaceholder: 'h2. Objetivo\n\n<AI prompt="Describe el objetivo de esta historia." system="Actúa como un escritor técnico." maxLines="5" />',
        saveTemplate: 'Guardar Plantilla',
    }
}

// Basic Jira markup to HTML renderer for preview
function renderJiraMarkup(text: string): string {
    if (!text) return '';
    return text
        .replace(/<AI\s+[^>]*\/?>/gs, (match) => `<div class="p-3 my-2 border-l-4 border-blue-400 bg-blue-50 text-blue-800 rounded-r-md dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-600">${match.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`)
        .replace(/^h1\.\s*(.*)/gm, '<h1>$1</h1>')
        .replace(/^h2\.\s*(.*)/gm, '<h2>$1</h2>')
        .replace(/^h3\.\s*(.*)/gm, '<h3>$1</h3>')
        .replace(/^h4\.\s*(.*)/gm, '<h4>$1</h4>')
        .replace(/^h5\.\s*(.*)/gm, '<h5>$1</h5>')
        .replace(/^h6\.\s*(.*)/gm, '<h6>$1</h6>')
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/\-(.*?)\-/g, '<del>$1</del>')
        .replace(/\+(.*?)\+/g, '<u>$1</u>')
        .replace(/{{(.*?)}}/g, '<code>$1</code>')
        .replace(/^bq\.\s*(.*)/gm, '<blockquote>$1</blockquote>')
        .replace(/^\*\s*(.*)/gm, '<ul><li>$1</li></ul>')
        .replace(/^#\s*(.*)/gm, '<ol><li>$1</li></ul>')
        .replace(/\[(.*?)\|(.*?)\]/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/!([^!]+)!/g, '<img src="$1" alt="Jira Image" class="max-w-full h-auto" />')
        .replace(/\\\\/g, '<br/>')
        .replace(/\n/g, '<br/>')
        .replace(/<\/li><br\/><ul><li>/g, '</li><li>') // fix list breaks
        .replace(/<\/li><br\/><ol><li>/g, '</li><li>');
}


interface TemplateEditorProps {
    template: string;
    onTemplateChange: (template: string) => void;
    onSave: () => void;
    saving: boolean;
    lang?: 'en' | 'es';
}

export function TemplateEditor({ template, onTemplateChange, onSave, saving, lang = 'en' }: TemplateEditorProps) {
    const t = translations[lang];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.templateTitle}</CardTitle>
                <CardDescription>
                    {t.templateDescription}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="editor" className="w-full">
                    <TabsList>
                        <TabsTrigger value="editor">{t.editorTab}</TabsTrigger>
                        <TabsTrigger value="preview">{t.previewTab}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="editor">
                         <div className="code-editor-container mt-2">
                             <Editor
                                value={template}
                                onValueChange={onTemplateChange}
                                highlight={(code) => Prism.highlight(code, Prism.languages['jira-ai-markup'], 'jira-ai-markup')}
                                placeholder={t.templatePlaceholder}
                                padding={16}
                                className="prism-editor"
                                textareaClassName="code-editor-textarea"
                                preClassName="code-editor-pre"
                            />
                         </div>
                    </TabsContent>
                    <TabsContent value="preview">
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-muted/50 p-4 mt-2 min-h-[20rem]"
                            dangerouslySetInnerHTML={{ __html: renderJiraMarkup(template) }}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter>
                <Button onClick={onSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.saveTemplate}
                </Button>
            </CardFooter>
        </Card>
    );
}
