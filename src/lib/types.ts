import type { Timestamp } from 'firebase/firestore';

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
}
