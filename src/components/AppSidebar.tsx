
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Home, Settings, Tags, LogOut, Code, Brackets, LifeBuoy, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppLogo } from './AppLogo';
import { useAuth } from './auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useSettings } from '@/hooks/use-settings';

const translations = {
  en: {
    generator: 'Generator',
    history: 'History',
    codes: 'Codes',
    projectCodes: 'Project Codes',
    taskCodes: 'Task Codes',
    settings: 'Settings',
    help: 'Help',
    signOut: 'Sign Out',
  },
  es: {
    generator: 'Generador',
    history: 'Historial',
    codes: 'Códigos',
    projectCodes: 'Códigos de Proyecto',
    taskCodes: 'Códigos de Tarea',
    settings: 'Configuración',
    help: 'Ayuda',
    signOut: 'Cerrar Sesión',
  }
};

export function AppSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { settings } = useSettings();
  const isCodesRoute = pathname.startsWith('/codes');
  const isHelpRoute = pathname.startsWith('/help');
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/'}
                tooltip={{ children: t.generator }}
              >
                <Link href="/">
                  <Home />
                  <span>{t.generator}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/history')}
                tooltip={{ children: t.history }}
              >
                <Link href="/history">
                  <History />
                  <span>{t.history}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <Collapsible defaultOpen={isCodesRoute}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        className="w-full"
                        isActive={isCodesRoute}
                        tooltip={{ children: t.codes }}
                        >
                        <Tags />
                        <span>{t.codes}</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname.startsWith('/codes/projects')}>
                      <Link href="/codes/projects"><Brackets /><span>{t.projectCodes}</span></Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname.startsWith('/codes/tasks')}>
                      <Link href="/codes/tasks"><Code /><span>{t.taskCodes}</span></Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isHelpRoute}
                tooltip={{ children: t.help }}
              >
                <Link href="/help">
                  <LifeBuoy />
                  <span>{t.help}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>


            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/settings'}
                tooltip={{ children: t.settings }}
              >
                <Link href="/settings">
                  <Settings />
                  <span>{t.settings}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            {user && (
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm overflow-hidden">
                    <span className="font-medium truncate">{user.displayName}</span>
                    <span className="text-muted-foreground truncate">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto shrink-0" onClick={signOut} title={t.signOut}>
                    <LogOut />
                </Button>
              </div>
            )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          <SidebarTrigger />
          <AppLogo />
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
