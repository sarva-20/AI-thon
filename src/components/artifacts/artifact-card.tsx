'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Artifact } from '@/lib/types';
import ArtifactViewDialog from './artifact-view-dialog';
import { Timestamp } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ArtifactCardProps {
  artifact: Artifact;
}

export default function ArtifactCard({ artifact }: ArtifactCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const placeholderImage = PlaceHolderImages.find(p => p.id === 'artifact-placeholder');

  const formatDate = (timestamp: Date | Timestamp) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader>
            <div className="relative h-48 w-full">
                {placeholderImage && (
                    <Image
                        src={placeholderImage.imageUrl}
                        alt={placeholderImage.description}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-t-lg"
                        data-ai-hint={placeholderImage.imageHint}
                    />
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
        </CardHeader>
        <CardContent className="flex-1">
          <CardTitle className="mb-2 text-lg font-bold">Session Summary</CardTitle>
          <CardDescription className="line-clamp-4 text-muted-foreground">
            {artifact.summary}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
            <p className="text-sm text-muted-foreground">
                Recorded on {formatDate(artifact.createdAt)}
            </p>
          <Button onClick={() => setIsDialogOpen(true)} className="w-full">View Details</Button>
        </CardFooter>
      </Card>
      <ArtifactViewDialog
        artifact={artifact}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
