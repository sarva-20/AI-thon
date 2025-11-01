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
import { User, Smile, Frown, Meh, Loader2, Share2, Download } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateSocialMediaPosts } from '@/ai/flows/generate-social-media-posts';
import ShareArtifactDialog from './share-artifact-dialog';
import type { GenerateSocialMediaPostsOutput } from '@/ai/flows/generate-social-media-posts';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { Timestamp } from 'firebase/firestore';


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
  
  const handleDownloadJson = () => {
    const artifactJson = JSON.stringify(artifact, (key, value) => {
      // Convert Firestore Timestamps to ISO strings
      if (value && typeof value === 'object' && value.seconds && value.nanoseconds) {
        return new Timestamp(value.seconds, value.nanoseconds).toDate().toISOString();
      }
      return value;
    }, 2);
    const blob = new Blob([artifactJson], { type: 'application/json' });
    saveAs(blob, `artifact_${artifact.id}.json`);
     toast({ title: 'JSON file downloaded.'});
  };

  const handleDownloadDocx = async () => {
    const formatDate = (timestamp: Date | Timestamp) => {
      const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };
    
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: "Session Artifact",
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({ text: `Recorded on: ${formatDate(artifact.createdAt)}`, style: 'IntenseQuote' }),
          
          new Paragraph({
            text: "Summary",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph(artifact.summary),
          
          new Paragraph({
            text: "Sentiment",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph(artifact.emotion || "Not analyzed"),

          new Paragraph({
            text: "Full Transcript",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          ...artifact.transcript.flatMap(segment => [
            new Paragraph({
              children: [
                new TextRun({ text: `${segment.speakerName}: `, bold: true }),
                new TextRun(segment.text),
              ],
              spacing: { after: 120 },
            }),
          ]),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `artifact_${artifact.id}.docx`);
    toast({ title: 'DOCX file downloaded.'});
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
          <DialogFooter className="gap-2 sm:justify-end">
             <Button variant="outline" onClick={handleDownloadJson}>
                <Download className="mr-2 h-4 w-4" />
                JSON
            </Button>
            <Button variant="outline" onClick={handleDownloadDocx}>
                <Download className="mr-2 h-4 w-4" />
                DOCX
            </Button>
            <Button variant="default" onClick={handleShare} disabled={isSharing}>
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
