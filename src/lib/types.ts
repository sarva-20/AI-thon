import type { Timestamp } from 'firebase/firestore';
import type { GenerateSocialMediaPostsOutput } from '@/ai/flows/generate-social-media-posts';

export interface TranscriptSegment {
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: Date | Timestamp;
}

export interface Artifact {
  id?: string;
  userId: string;
  createdAt: Date | Timestamp;
  summary: string;
  transcript: TranscriptSegment[];
  emotion?: string;
  socialMediaPosts?: GenerateSocialMediaPostsOutput;
}
