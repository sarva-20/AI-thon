'use client';

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-artifact-metadata.ts';
import '@/ai/flows/summarize-audio-session.ts';
import '@/ai/flows/transcribe-audio-segments.ts';
import '@/ai/flows/generate-social-media-posts';
