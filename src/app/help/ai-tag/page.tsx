
'use client';

import { HelpPageLayout } from '@/components/help/HelpPageLayout';
import { useSettings } from '@/hooks/use-settings';

const translations = {
  en: {
    title: 'Using the <AI/> Tag',
    description: 'The <AI/> tag is a powerful feature that allows you to dynamically insert AI-generated content directly into your Jira story or subtask descriptions based on a template.',
    howItWorks: 'How It Works',
    howItWorksContent: [
        'When you create a template for a Project or a Task Code, you can include one or more `<AI/>` tags.',
        'Each tag must contain a `prompt` attribute, which tells the AI what to generate.',
        'When you fill out the main form, the text you provide in the "AI Context" field is sent to the AI along with your prompts.',
        'The AI uses this context to generate relevant content for each `<AI/>` tag in your template.'
    ],
    attributes: 'Tag Attributes',
    promptTitle: 'prompt="your instruction"',
    promptDescription: ' (Required) This is the main instruction for the AI. It should be a clear and concise request for the content you want to generate. For example: `prompt="Write three acceptance criteria for this feature."`',
    systemTitle: 'system="persona"',
    systemDescription: ' (Optional) This attribute defines the "persona" or role the AI should adopt. This helps in getting more specific and well-formatted responses. For example: `system="Act as a QA Engineer."` or `system="You are a senior technical writer."`',
    maxLinesTitle: 'maxLines="number"',
    maxLinesDescription: ' (Optional, Default: 5) This attribute controls the maximum number of lines for the generated content. Use it to keep responses concise and control token usage. For example: `maxLines="3"`',
    example: 'Complete Example',
    exampleDescription: 'Here’s how you might structure a template for a development story:',
    exampleCode: `
h2. Description
<AI prompt="Provide a brief, one-paragraph summary of the user story's goal." system="Act as a product manager." maxLines="5" />

h2. Acceptance Criteria
<AI prompt="List at least three specific acceptance criteria for this story in a numbered list." system="Act as a QA Engineer." maxLines="10" />

h2. Technical Implementation Details
<AI prompt="Suggest a high-level technical approach for implementing this feature. Mention key components or services that might be involved." system="Act as a senior software engineer." maxLines="15" />
`,
    importantNote: 'Important Note on Token Usage',
    importantNoteContent: 'To optimize performance and reduce costs, all `<AI/>` tags within a single template are processed in one batch request to the AI. If the "AI Context" field in the main form is left empty, the `<AI/>` tags will be removed from the final description, and no AI call will be made, thus consuming no tokens.',
  },
  es: {
    title: 'Uso de la Etiqueta <AI/>',
    description: 'La etiqueta <AI/> es una potente función que te permite insertar dinámicamente contenido generado por IA directamente en las descripciones de tus historias o subtareas de Jira a partir de una plantilla.',
    howItWorks: 'Cómo Funciona',
    howItWorksContent: [
        'Cuando creas una plantilla para un Proyecto o un Código de Tarea, puedes incluir una o más etiquetas `<AI/>`.',
        'Cada etiqueta debe contener un atributo `prompt`, que le dice a la IA qué generar.',
        'Cuando llenas el formulario principal, el texto que proporcionas en el campo "Contexto para la IA" se envía a la IA junto con tus prompts.',
        'La IA utiliza este contexto para generar contenido relevante para cada etiqueta `<AI/>` en tu plantilla.'
    ],
    attributes: 'Atributos de la Etiqueta',
    promptTitle: 'prompt="tu instrucción"',
    promptDescription: ' (Requerido) Esta es la instrucción principal para la IA. Debe ser una solicitud clara y concisa del contenido que deseas generar. Por ejemplo: `prompt="Escribe tres criterios de aceptación para esta funcionalidad."`',
    systemTitle: 'system="rol"',
    systemDescription: ' (Opcional) Este atributo define el "rol" que la IA debe adoptar. Esto ayuda a obtener respuestas más específicas y mejor formateadas. Por ejemplo: `system="Actúa como un Ingeniero de QA."` o `system="Eres un escritor técnico senior."`',
    maxLinesTitle: 'maxLines="número"',
    maxLinesDescription: ' (Opcional, Predeterminado: 5) Este atributo controla el número máximo de líneas para el contenido generado. Úsalo para mantener las respuestas concisas y controlar el uso de tokens. Por ejemplo: `maxLines="3"`',
    example: 'Ejemplo Completo',
    exampleDescription: 'Así es como podrías estructurar una plantilla para una historia de desarrollo:',
    exampleCode: `
h2. Descripción
<AI prompt="Proporciona un breve resumen de un párrafo sobre el objetivo de la historia de usuario." system="Actúa como un jefe de producto." maxLines="5" />

h2. Criterios de Aceptación
<AI prompt="Enumera al menos tres criterios de aceptación específicos para esta historia en una lista numerada." system="Actúa como un Ingeniero de QA." maxLines="10" />

h2. Detalles de Implementación Técnica
<AI prompt="Sugiere un enfoque técnico de alto nivel para implementar esta funcionalidad. Menciona componentes o servicios clave que podrían estar involucrados." system="Actúa como un ingeniero de software senior." maxLines="15" />
`,
    importantNote: 'Nota Importante sobre el Uso de Tokens',
    importantNoteContent: 'Para optimizar el rendimiento y reducir costos, todas las etiquetas `<AI/>` dentro de una misma plantilla se procesan en una sola solicitud por lotes a la IA. Si el campo "Contexto para la IA" en el formulario principal se deja vacío, las etiquetas `<AI/>` se eliminarán de la descripción final y no se realizará ninguna llamada a la IA, por lo que no se consumirán tokens.',
  }
};

export default function AiTagHelpPage() {
    const { settings } = useSettings();
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    return (
        <HelpPageLayout title={t.title} description={t.description}>
            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-bold mb-2">{t.howItWorks}</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {t.howItWorksContent.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-2">{t.attributes}</h2>
                    <ul className="space-y-3">
                        <li>
                            <code className="font-mono font-bold">{t.promptTitle}</code>
                            <p className="text-muted-foreground">{t.promptDescription}</p>
                        </li>
                        <li>
                            <code className="font-mono font-bold">{t.systemTitle}</code>
                            <p className="text-muted-foreground">{t.systemDescription}</p>
                        </li>
                         <li>
                            <code className="font-mono font-bold">{t.maxLinesTitle}</code>
                            <p className="text-muted-foreground">{t.maxLinesDescription}</p>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-2">{t.example}</h2>
                    <p className="text-muted-foreground mb-2">{t.exampleDescription}</p>
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md bg-muted/50">
                        <pre><code>{t.exampleCode.trim()}</code></pre>
                    </div>
                </section>
                
                 <section>
                    <h2 className="text-xl font-bold mb-2">{t.importantNote}</h2>
                    <p className="text-muted-foreground">{t.importantNoteContent}</p>
                </section>
            </div>
        </HelpPageLayout>
    );
}
