'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Artifact } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { User } from 'lucide-react';

interface ArtifactViewDialogProps {
  artifact: Artifact;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ArtifactViewDialog({ artifact, isOpen, onOpenChange }: ArtifactViewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription>
            A complete record of your session transcript and summary.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-md">{artifact.summary}</p>
            </div>
            <Separator />
            <div>
                 <h3 className="text-lg font-semibold mb-2">Full Transcript</h3>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="space-y-4">
                        {artifact.transcript.map((segment, index) => (
                        <div key={index} className="flex items-start gap-3">
                             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shrink-0">
                                <User className="h-5 w-5 text-secondary-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="font-semibold text-sm">{segment.speakerName}</p>
                                <p className="text-sm text-muted-foreground">{segment.text}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
