import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Bot className="h-6 w-6 text-primary" />
      <span className="text-lg font-bold tracking-tight">Jira Assist</span>
    </div>
  );
}
