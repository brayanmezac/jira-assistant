
// Basic Jira markup to HTML renderer for preview
export function renderJiraMarkup(text: string): string {
    if (!text) return '';
    return text
        .replace(/<AI\s+([^>]*)\/?>/gs, (match) => `<div class="p-3 my-2 border-l-4 border-blue-400 bg-blue-50 text-blue-800 rounded-r-md dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-600">${match.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`)
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
