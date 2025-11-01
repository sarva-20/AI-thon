'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Mic,
  Save,
  Loader2,
  Sparkles,
  User,
  MessageSquare,
  PanelLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { transcribeAudioSegments } from '@/ai/flows/transcribe-audio-segments';
import { generateArtifactMetadata } from '@/ai/flows/generate-artifact-metadata';
import { useToast } from '@/hooks/use-toast';
import { saveArtifact } from '@/lib/firestore';
import type { TranscriptSegment } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthButton } from '@/components/auth/auth-button';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return user ? (
    <AudioRoom />
  ) : (
    <LandingPage />
  );
}

function LandingPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

    return (
        <div className="flex min-h-screen flex-col">
            <header className="container mx-auto flex h-20 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Voicepool</h1>
                </div>
                <AuthButton />
            </header>
            <main className="flex-1">
                <section className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 py-16 md:grid-cols-2 lg:py-24">
                    <div className="space-y-6">
                        <Badge variant="outline" className="border-primary/50 text-primary">Powered by AI</Badge>
                        <h1 className="font-headline text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
                            Transform Conversations into Actionable Insights
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Voicepool provides real-time audio rooms with live transcription and intelligent summarization. Capture every detail, effortlessly.
                        </p>
                        <div className="flex items-center gap-4">
                            <AuthButton />
                            <Button variant="outline">Learn More</Button>
                        </div>
                    </div>
                    <div className="relative h-64 w-full overflow-hidden rounded-lg shadow-2xl md:h-96">
                        {heroImage && (
                             <Image
                                src={heroImage.imageUrl}
                                alt={heroImage.description}
                                fill
                                style={{ objectFit: 'cover' }}
                                data-ai-hint={heroImage.imageHint}
                             />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
                    </div>
                </section>
            </main>
        </div>
    );
}


function AudioRoom() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // For transcription and summarization
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  }, []);

  const handlePushToTalkStart = async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true },
      });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });

        // Convert blob to base64 data URI
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          try {
            const { transcription } = await transcribeAudioSegments({ audioDataUri: base64data });
            if (transcription && user) {
              setTranscriptSegments((prev) => [
                ...prev,
                { speakerId: user.uid, speakerName: user.displayName || 'User', text: transcription, timestamp: new Date() },
              ]);
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast({
              variant: 'destructive',
              title: 'Transcription Failed',
              description: 'Could not transcribe the audio segment.',
            });
          } finally {
            setIsProcessing(false);
          }
        };

        // Clean up stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: 'destructive',
        title: 'Microphone Error',
        description: 'Could not access your microphone. Please check permissions.',
      });
    }
  };

  const handlePushToTalkStop = () => {
    stopRecording();
  };

  const handleEndSession = async () => {
    if (!user || transcriptSegments.length === 0) {
      toast({
        title: 'Session is empty',
        description: 'Record some audio before saving the session.',
      });
      return;
    }

    setIsProcessing(true);
    const fullTranscript = transcriptSegments.map((seg) => seg.text).join('\n');

    try {
      const { summary } = await generateArtifactMetadata({ transcript: fullTranscript });
      const artifact = {
        userId: user.uid,
        transcript: transcriptSegments,
        summary: summary,
      };

      await saveArtifact(user.uid, artifact);

      toast({
        title: 'Session Saved',
        description: 'Your session artifact has been successfully saved.',
      });
      setTranscriptSegments([]);
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'There was an error saving your session.',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  const PushToTalkButton = () => (
      <button
        onMouseDown={handlePushToTalkStart}
        onMouseUp={handlePushToTalkStop}
        onTouchStart={handlePushToTalkStart}
        onTouchEnd={handlePushToTalkStop}
        disabled={isProcessing}
        className={`relative flex h-24 w-24 items-center justify-center rounded-full border-4 transition-all duration-200 ${
          isRecording ? 'border-red-500 bg-red-400' : 'border-primary bg-primary/80'
        } focus:outline-none focus:ring-4 focus:ring-primary/50 active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:border-muted-foreground`}
        aria-label="Push to Talk"
      >
        {isRecording && (
          <span className="absolute h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        )}
        <Mic className={`h-10 w-10 transition-colors ${isRecording ? 'text-white' : 'text-primary-foreground'}`} />
      </button>
  );

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <AppSidebar />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 p-4 md:p-6">
            <ScrollArea className="h-full max-h-[calc(100vh-220px)] pr-4">
              <div className="space-y-6">
                {transcriptSegments.length === 0 && !isProcessing && (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-full">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold text-muted-foreground">The conversation starts here</h3>
                    <p className="mt-1 text-sm text-muted-foreground/80">
                      Press and hold the microphone button to start speaking.
                    </p>
                  </div>
                )}
                {transcriptSegments.map((segment, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                          <User className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold">{segment.speakerName}</p>
                          <p className="text-muted-foreground">{segment.text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                 {isProcessing && !isRecording && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing audio...</span>
                    </div>
                 )}
              </div>
            </ScrollArea>
          </div>
          <footer className="flex flex-col items-center justify-center gap-4 border-t bg-background/50 p-4 backdrop-blur-sm">
            <PushToTalkButton />
            <div className="flex items-center gap-4">
              <Button
                onClick={handleEndSession}
                disabled={isProcessing || transcriptSegments.length === 0}
                variant="outline"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                End & Save Session
              </Button>
            </div>
          </footer>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
