
'use client';

import { HelpPageLayout } from '@/components/help/HelpPageLayout';
import { useSettings } from '@/hooks/use-settings';

const translations = {
  en: {
    title: 'Jira Assist - General Guide',
    description: 'A complete overview of how to use the tool, from initial setup to ticket creation.',
    
    sections: [
      {
        title: '1. Initial Setup (Settings)',
        content: [
          'The first step is to configure your connection to Jira.',
          'Go to the **Settings** page from the sidebar.',
          '**Jira URL:** Enter the base URL of your Jira instance (e.g., `https://your-company.atlassian.net`).',
          '**Jira User Email:** The email associated with your Jira account.',
          '**Jira API Token:** Generate an API token from your Atlassian account settings. This is more secure than using your password.',
          '**Issue Type Mapping:** Select the default issue types for "Epic" and "Story". This is crucial for ticket creation.',
          '**Appearance:** Choose your preferred language and theme (Light/Dark/System).',
          'Click **Save Settings**. The application will validate your connection details.'
        ]
      },
      {
        title: '2. Configuring Project Codes',
        content: [
          'Go to **Codes > Project Codes**.',
          'Here, you map a user-friendly name (e.g., "Main App") to an official Jira Project Key (e.g., "APP").',
          'You can add projects manually or import them directly from your Jira instance using the "Import from Jira" button.',
          'Each project can have its own **Description Template**. Click the document icon to edit it.'
        ]
      },
      {
        title: '3. Configuring Task Codes (Subtasks)',
        content: [
          'Go to **Codes > Task Codes**.',
          'These represent the different types of subtasks you want to create (e.g., Analysis, Development, QA).',
          '**Code (Issue Type ID):** This must be the numerical ID of the subtask issue type in Jira. You can import these from Jira to get the correct IDs and icons.',
          '**Status:** A task can be Active or Inactive. Inactive tasks will not be created.',
          '**Projects:** A task can be "General" (applies to all projects) or assigned to one or more specific projects.',
          '**Template:** Just like projects, each task type can have its own description template. Click the document icon to edit it.'
        ]
      },
      {
        title: '4. Using Templates and the <AI/> Tag',
        content: [
          'Templates allow you to pre-define the structure of your Jira story and subtask descriptions.',
          'They use Jira\'s wiki markup format.',
          'The most powerful feature is the **<AI/>** tag, which lets you insert dynamically generated content. See the specific `<AI/> Tag` help article for detailed instructions.'
        ]
      },
      {
        title: '5. Generating Tickets',
        content: [
          'Go to the **Generator** page.',
          '**Select a Project:** Choose one of the projects you configured.',
          '**Story Name & Number:** Fill in the basic details of your story.',
          '**AI Context:** This is the most important field. Provide all the necessary information—meeting notes, technical specs, user requirements, etc. This context will be used by the `<AI/>` tags in your templates.',
          '**Select an AI Model:** Choose between available models like Gemini or OpenAI.',
          'Click **Prepare for Jira**. The app will process your templates and generate the final content.',
          'Review the generated story description and the list of subtasks that will be created.',
          'If everything looks correct, click **Create in Jira** to generate the tickets in your Jira instance.'
        ]
      }
    ]
  },
  es: {
    title: 'Jira Assist - Guía General',
    description: 'Un resumen completo sobre cómo usar la herramienta, desde la configuración inicial hasta la creación de tickets.',
    sections: [
      {
        title: '1. Configuración Inicial (Ajustes)',
        content: [
          'El primer paso es configurar tu conexión a Jira.',
          'Ve a la página de **Configuración** desde la barra lateral.',
          '**URL de Jira:** Ingresa la URL base de tu instancia de Jira (ej: `https://tu-empresa.atlassian.net`).',
          '**Email de Usuario de Jira:** El correo electrónico asociado a tu cuenta de Jira.',
          '**Token de API de Jira:** Genera un token de API desde la configuración de tu cuenta de Atlassian. Es más seguro que usar tu contraseña.',
          '**Mapeo de Tipos de Incidencia:** Selecciona los tipos de incidencia por defecto para "Epic" e "Historia". Esto es crucial para la creación de tickets.',
          '**Apariencia:** Elige tu idioma y tema preferido (Claro/Oscuro/Sistema).',
          'Haz clic en **Guardar Configuración**. La aplicación validará tus detalles de conexión.'
        ]
      },
      {
        title: '2. Configurando Códigos de Proyecto',
        content: [
          'Ve a **Códigos > Códigos de Proyecto**.',
          'Aquí, mapeas un nombre amigable (ej: "App Principal") a una Clave de Proyecto oficial de Jira (ej: "APP").',
          'Puedes agregar proyectos manualmente o importarlos directamente desde tu instancia de Jira usando el botón "Importar desde Jira".',
          'Cada proyecto puede tener su propia **Plantilla de Descripción**. Haz clic en el ícono de documento para editarla.'
        ]
      },
      {
        title: '3. Configurando Códigos de Tarea (Subtareas)',
        content: [
          'Ve a **Códigos > Códigos de Tarea**.',
          'Estos representan los diferentes tipos de subtareas que deseas crear (ej: Análisis, Desarrollo, QA).',
          '**Código (ID de Tipo de Incidencia):** Este debe ser el ID numérico del tipo de incidencia de subtarea en Jira. Puedes importarlos desde Jira para obtener los IDs e íconos correctos.',
          '**Estado:** una tarea puede estar Activa o Inactiva. Las tareas inactivas no se crearán.',
          '**Proyectos:** Una tarea puede ser "General" (se aplica a todos los proyectos) o asignarse a uno o más proyectos específicos.',
          '**Plantilla:** Al igual que los proyectos, cada tipo de tarea puede tener su propia plantilla de descripción. Haz clic en el ícono de documento para editarla.'
        ]
      },
      {
        title: '4. Usando Plantillas y la Etiqueta <AI/>',
        content: [
          'Las plantillas te permiten predefinir la estructura de las descripciones de tus historias y subtareas de Jira.',
          'Utilizan el formato de marcado wiki de Jira.',
          'La función más potente es la etiqueta **<AI/>**, que te permite insertar contenido generado dinámicamente. Consulta el artículo de ayuda específico de la `Etiqueta <AI/>` para obtener instrucciones detalladas.'
        ]
      },
      {
        title: '5. Generando Tickets',
        content: [
          'Ve a la página **Generador**.',
          '**Selecciona un Proyecto:** Elige uno de los proyectos que configuraste.',
          '**Nombre y Número de Historia:** Completa los detalles básicos de tu historia.',
          '**Contexto para la IA:** Este es el campo más importante. Proporciona toda la información necesaria: notas de reuniones, especificaciones técnicas, requisitos de usuario, etc. Este contexto será utilizado por las etiquetas `<AI/>` en tus plantillas.',
          '**Selecciona un Modelo de IA:** Elige entre los modelos disponibles como Gemini u OpenAI.',
          'Haz clic en **Preparar para Jira**. La aplicación procesará tus plantillas y generará el contenido final.',
          'Revisa la descripción de la historia generada y la lista de subtareas que se crearán.',
          'Si todo parece correcto, haz clic en **Crear en Jira** para generar los tickets en tu instancia de Jira.'
        ]
      }
    ]
  }
};


export default function ToolGuidePage() {
    const { settings } = useSettings();
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    return (
        <HelpPageLayout title={t.title} description={t.description}>
            <div className="space-y-8">
                {t.sections.map((section, index) => (
                    <section key={index}>
                        <h2 className="text-xl font-bold mb-3 border-b pb-2">{section.title}</h2>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                           {section.content.map((item, itemIndex) => (
                             <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                           ))}
                        </ul>
                    </section>
                ))}
            </div>
        </HelpPageLayout>
    );
}
