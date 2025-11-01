'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating social media posts from a transcript.
 *
 * - generateSocialMediaPosts - A function that generates social media content.
 * - GenerateSocialMediaPostsInput - The input type for the function.
 * - GenerateSocialMediaPostsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSocialMediaPostsInputSchema = z.object({
  transcript: z.string().describe('The full transcript of the audio session.'),
  summary: z.string().describe('A summary of the session.'),
});
export type GenerateSocialMediaPostsInput = z.infer<
  typeof GenerateSocialMediaPostsInputSchema
>;

const SocialPostSchema = z.object({
  title: z.string().optional().describe('A title for the post, if applicable (e.g., for a blog post).'),
  content: z.string().describe('The body content of the social media post.'),
});

const GenerateSocialMediaPostsOutputSchema = z.object({
  linkedIn: SocialPostSchema.describe('A professional post for LinkedIn, focusing on insights and discussion points.'),
  x: SocialPostSchema.describe('A short, punchy post for X (formerly Twitter) with relevant hashtags.'),
  instagram: SocialPostSchema.describe('An engaging caption for an Instagram post. Suggest a visual if possible.'),
  threads: SocialPostSchema.describe('A conversational post for Threads, designed to start a discussion.'),
  medium: SocialPostSchema.describe('A draft for a Medium blog post, including a title and an introductory paragraph.'),
  devto: SocialPostSchema.describe('A draft for a dev.to article, with a technical focus, including a title and introduction.'),
});
export type GenerateSocialMediaPostsOutput = z.infer<
  typeof GenerateSocialMediaPostsOutputSchema
>;

export async function generateSocialMediaPosts(
  input: GenerateSocialMediaPostsInput
): Promise<GenerateSocialMediaPostsOutput> {
  return generateSocialMediaPostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSocialMediaPostsPrompt',
  input: { schema: GenerateSocialMediaPostsInputSchema },
  output: { schema: GenerateSocialMediaPostsOutputSchema },
  prompt: `You are a social media manager for a podcast creator. Your task is to generate compelling social media content based on the provided transcript and summary from a recent session. The tone should be from the creator's perspective.

  **Session Summary:**
  {{{summary}}}

  **Full Transcript:**
  {{{transcript}}}

  Please generate content for the following platforms with the specified tones:
  - **LinkedIn:** Professional and insightful. Encourage discussion and networking.
  - **X (Twitter):** Short, punchy, and impactful. Use relevant hashtags to maximize reach.
  - **Instagram:** Engaging and visual. Write a caption that would accompany a relevant image, carousel, or video clip.
  - **Threads:** Conversational and community-focused. Ask a question to spark a dialogue.
  - **Medium:** A blog post format. Provide a compelling title and an introductory paragraph that hooks the reader.
  - **dev.to:** A developer-focused blog post. Create a catchy, technical title and an intro paragraph. If the content isn't technical, adapt it as best as possible or state that it's not a good fit.
  `,
});

const generateSocialMediaPostsFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaPostsFlow',
    inputSchema: GenerateSocialMediaPostsInputSchema,
    outputSchema: GenerateSocialMediaPostsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
