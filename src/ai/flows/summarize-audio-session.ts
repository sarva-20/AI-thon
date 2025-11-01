'use server';

/**
 * @fileOverview Summarizes an audio session using the Gemini model.
 *
 * - summarizeAudioSession - A function that summarizes an audio session.
 * - SummarizeAudioSessionInput - The input type for the summarizeAudioSession function.
 * - SummarizeAudioSessionOutput - The return type for the summarizeAudioSession function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAudioSessionInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the entire audio session.'),
});
export type SummarizeAudioSessionInput = z.infer<
  typeof SummarizeAudioSessionInputSchema
>;

const SummarizeAudioSessionOutputSchema = z.object({
  summary: z.string().describe('The summary of the entire audio session.'),
});
export type SummarizeAudioSessionOutput = z.infer<
  typeof SummarizeAudioSessionOutputSchema
>;

export async function summarizeAudioSession(
  input: SummarizeAudioSessionInput
): Promise<SummarizeAudioSessionOutput> {
  return summarizeAudioSessionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAudioSessionPrompt',
  input: {schema: SummarizeAudioSessionInputSchema},
  output: {schema: SummarizeAudioSessionOutputSchema},
  prompt: `You are an expert summarizer, skilled at distilling key information from long transcripts.

  Please provide a concise summary of the following audio session transcript. Focus on key decisions, action items, and main points of discussion.

  Transcript: {{{transcript}}}`,
});

const summarizeAudioSessionFlow = ai.defineFlow(
  {
    name: 'summarizeAudioSessionFlow',
    inputSchema: SummarizeAudioSessionInputSchema,
    outputSchema: SummarizeAudioSessionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
