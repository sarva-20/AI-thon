
'use client';

import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { transcribeAudioSegments } from '@/ai/flows/transcribe-audio-segments';
import type { TranscriptSegment } from '@/lib/types';
import type { User } from 'firebase/auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useAudioRecorder = (user: User | null) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

        try {
          // 1. Upload audio to Firebase Storage
          const timestamp = new Date().getTime();
          const storagePath = `audio/${user?.uid || 'unknown'}/${timestamp}.wav`;
          const storageRef = ref(storage, storagePath);
          const uploadResult = await uploadBytes(storageRef, audioBlob);
          const audioUrl = await getDownloadURL(uploadResult.ref);

          // 2. Transcribe audio using Genkit flow
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            try {
              const { transcription } = await transcribeAudioSegments({ audioDataUri: base64data });
              if (transcription && user) {
                // 3. Add segment with text and audio URL to state
                setTranscriptSegments((prev) => [
                  ...prev,
                  {
                    speakerId: user.uid,
                    speakerName: user.displayName || 'User',
                    text: transcription,
                    timestamp: new Date(),
                    audioUrl: audioUrl,
                  },
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
        } catch (storageError) {
            console.error('Audio upload error:', storageError);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'Could not save the recorded audio.',
            });
            setIsProcessing(false);
        }

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

  return {
    isRecording,
    isProcessing,
    transcriptSegments,
    setTranscriptSegments,
    handlePushToTalkStart,
    handlePushToTalkStop,
    stopRecording
  };
};
