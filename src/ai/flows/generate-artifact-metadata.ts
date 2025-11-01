'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating artifact metadata, including a transcript, a summary, and sentiment analysis of the session.
 *
 * - generateArtifactMetadata - A function that orchestrates the generation of artifact metadata.
 * - GenerateArtifactMetadataInput - The input type for the generateArtifactMetadata function.
 * - GenerateArtifactMetadataOutput - The return type for the generateArtifactMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArtifactMetadataInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the audio session.'),
});
export type GenerateArtifactMetadataInput = z.infer<
  typeof GenerateArtifactMetadataInputSchema
>;

const GenerateArtifactMetadataOutputSchema = z.object({
  summary: z.string().describe('A summary of the audio session based on importance.'),
  emotion: z.string().describe('The dominant emotion or sentiment of the conversation (e.g., "Positive", "Negative", "Neutral", "Mixed", "Happy", "Concerned").'),
});
export type GenerateArtifactMetadataOutput = z.infer<
  typeof GenerateArtifactMetadataOutputSchema
>;

export async function generateArtifactMetadata(
  input: GenerateArtifactMetadataInput
): Promise<GenerateArtifactMetadataOutput> {
  return generateArtifactMetadataFlow(input);
}

const generateArtifactMetadataPrompt = ai.definePrompt({
  name: 'generateArtifactMetadataPrompt',
  input: {schema: GenerateArtifactMetadataInputSchema},
  output: {schema: GenerateArtifactMetadataOutputSchema},
  prompt: `You are an AI expert in analyzing and summarizing audio transcripts.

  Analyze the following transcript and perform two tasks:
  1.  Provide a concise and informative summary of the key points, ordered by importance.
  2.  Perform sentiment analysis on the overall conversation and determine the dominant emotion.

  Transcript:
  {{{transcript}}}`,
});

const generateArtifactMetadataFlow = ai.defineFlow(
  {
    name: 'generateArtifactMetadataFlow',
    inputSchema: GenerateArtifactMetadataInputSchema,
    outputSchema: GenerateArtifactMetadataOutputSchema,
  },
  async input => {
    const {output} = await generateArtifactMetadataPrompt(input);
    return output!;
  }
);
