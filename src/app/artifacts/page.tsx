'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getArtifacts } from '@/lib/firestore';
import type { Artifact } from '@/lib/types';
import { Loader2, Archive, MessageSquare } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import ArtifactCard from '@/components/artifacts/artifact-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArtifactsPage() {
  const { user, loading: authLoading } = useAuth();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getArtifacts(user.uid)
        .then(setArtifacts)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const isLoading = authLoading || loading;

  const ArtifactsSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <AppSidebar />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Archive className="h-6 w-6" />
              My Artifacts
            </h1>
            <p className="text-muted-foreground">
              Review your past sessions and their summaries.
            </p>
          </div>
          {isLoading ? (
            <ArtifactsSkeleton />
          ) : artifacts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {artifacts.map((artifact) => (
                <ArtifactCard key={artifact.id} artifact={artifact} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-[400px]">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No artifacts yet</h3>
                <p className="mt-1 text-sm text-muted-foreground/80">
                  Your saved sessions will appear here once you complete a recording.
                </p>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
