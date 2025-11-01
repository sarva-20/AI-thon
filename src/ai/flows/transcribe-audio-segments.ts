'use server';
/**
 * @fileOverview Flow for transcribing audio segments into text.
 *
 * - transcribeAudioSegments - A function that transcribes the audio.
 * - TranscribeAudioSegmentsInput - The input type for the transcribeAudioSegments function.
 * - TranscribeAudioSegmentsOutput - The return type for the transcribeAudioSegments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import wav from 'wav';

const TranscribeAudioSegmentsInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A recorded audio segment as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' for WAV audio."
    ),
});
export type TranscribeAudioSegmentsInput = z.infer<typeof TranscribeAudioSegmentsInputSchema>;

const TranscribeAudioSegmentsOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text of the audio segment.'),
});
export type TranscribeAudioSegmentsOutput = z.infer<typeof TranscribeAudioSegmentsOutputSchema>;

export async function transcribeAudioSegments(input: TranscribeAudioSegmentsInput): Promise<TranscribeAudioSegmentsOutput> {
  return transcribeAudioSegmentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribeAudioSegmentsPrompt',
  input: {schema: TranscribeAudioSegmentsInputSchema},
  output: {schema: TranscribeAudioSegmentsOutputSchema},
  prompt: `Transcribe the following audio segment to text:
  
  Audio: {{media url=audioDataUri}}
  
  Transcription:`,
});

const transcribeAudioSegmentsFlow = ai.defineFlow(
  {
    name: 'transcribeAudioSegmentsFlow',
    inputSchema: TranscribeAudioSegmentsInputSchema,
    outputSchema: TranscribeAudioSegmentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
