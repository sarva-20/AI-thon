'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy } from 'lucide-react';
import type { GenerateSocialMediaPostsOutput } from '@/ai/flows/generate-social-media-posts';

interface ShareArtifactDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  posts: GenerateSocialMediaPostsOutput;
}

type Platform = keyof GenerateSocialMediaPostsOutput;

export default function ShareArtifactDialog({ isOpen, onOpenChange, posts }: ShareArtifactDialogProps) {
  const [editedPosts, setEditedPosts] = useState(posts);
  const { toast } = useToast();
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  const handlePostChange = (platform: Platform, field: 'title' | 'content', value: string) => {
    setEditedPosts(prev => ({
        ...prev,
        [platform]: {
            ...prev[platform],
            [field]: value
        }
    }));
  }

  const platformNames: Record<Platform, string> = {
    x: 'X (Twitter)',
    linkedIn: 'LinkedIn',
    instagram: 'Instagram',
    threads: 'Threads',
    medium: 'Medium',
    devto: 'Dev.to',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Share Your Session</DialogTitle>
          <DialogDescription>
            AI-generated posts tailored for each platform. Edit and copy the content to share.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="x" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            {(Object.keys(editedPosts) as Platform[]).map(platform => (
              <TabsTrigger key={platform} value={platform}>
                {platformNames[platform]}
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(editedPosts) as Platform[]).map(platform => {
             const post = editedPosts[platform];
             const uniqueContentId = `${platform}-content`;
             const uniqueTitleId = `${platform}-title`;

             return (
                 <TabsContent key={platform} value={platform}>
                    <div className="space-y-4 p-4 bg-secondary/50 rounded-md">
                        {post.title && (
                            <div className="space-y-2">
                                <Label htmlFor={uniqueTitleId}>Title</Label>
                                <div className="relative">
                                     <Input 
                                        id={uniqueTitleId} 
                                        value={post.title} 
                                        onChange={(e) => handlePostChange(platform, 'title', e.target.value)}
                                        className="pr-12"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                        onClick={() => handleCopy(post.title!, uniqueTitleId)}
                                    >
                                        {copiedStates[uniqueTitleId] ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor={uniqueContentId}>Content</Label>
                             <div className="relative">
                                <Textarea 
                                    id={uniqueContentId} 
                                    value={post.content} 
                                    onChange={(e) => handlePostChange(platform, 'content', e.target.value)}
                                    rows={8}
                                    className="pr-12"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-2 h-7 w-7"
                                    onClick={() => handleCopy(post.content, uniqueContentId)}
                                >
                                    {copiedStates[uniqueContentId] ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
             )
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
