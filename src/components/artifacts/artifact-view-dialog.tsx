'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Artifact } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { User, Smile, Frown, Meh, Loader2, Share2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateSocialMediaPosts } from '@/ai/flows/generate-social-media-posts';
import ShareArtifactDialog from './share-artifact-dialog';
import type { GenerateSocialMediaPostsOutput } from '@/ai/flows/generate-social-media-posts';

interface ArtifactViewDialogProps {
  artifact: Artifact;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ArtifactViewDialog({ artifact, isOpen, onOpenChange }: ArtifactViewDialogProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [socialPosts, setSocialPosts] = useState<GenerateSocialMediaPostsOutput | null>(null);
  const { toast } = useToast();

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion?.toLowerCase()) {
      case 'positive':
      case 'happy':
      case 'joy':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
      case 'sad':
      case 'angry':
      case 'concerned':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (artifact.socialMediaPosts) {
        setSocialPosts(artifact.socialMediaPosts);
      } else {
        const fullTranscript = artifact.transcript.map(t => t.text).join('\n');
        const posts = await generateSocialMediaPosts({
          transcript: fullTranscript,
          summary: artifact.summary,
        });
        setSocialPosts(posts);
        // Optionally, you could save these posts back to the artifact in Firestore
      }
      setIsShareDialogOpen(true);
    } catch (error) {
      console.error('Failed to generate social media posts:', error);
      toast({
        variant: 'destructive',
        title: 'Sharing Failed',
        description: 'Could not generate content for social media.',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
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
            {artifact.emotion && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Sentiment</h3>
                <Badge variant="outline" className="flex items-center gap-2 w-fit">
                  {getEmotionIcon(artifact.emotion)}
                  <span>{artifact.emotion}</span>
                </Badge>
              </div>
            )}
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
          <DialogFooter>
            <Button variant="outline" onClick={handleShare} disabled={isSharing}>
              {isSharing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {socialPosts && (
        <ShareArtifactDialog
          isOpen={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          posts={socialPosts}
        />
      )}
    </>
  );
}
