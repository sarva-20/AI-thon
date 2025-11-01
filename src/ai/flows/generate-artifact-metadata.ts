'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating artifact metadata, including a transcript and a summary of the session.
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
  summary: z.string().describe('A summary of the audio session.'),
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
  prompt: `You are an AI expert in summarizing audio transcripts. Please provide a concise and informative summary of the following transcript:\n\nTranscript: {{{transcript}}}`,
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
