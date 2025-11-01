'use client';

import { MessageSquare } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserNav from '@/components/auth/user-nav';
import { useSidebar } from '@/components/ui/sidebar';

export default function Header() {
  const { isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        <MessageSquare className="hidden h-6 w-6 text-primary md:block" />
        <h1 className="hidden text-xl font-bold md:block">Voicepool</h1>
      </div>

      <UserNav />
    </header>
  );
}
