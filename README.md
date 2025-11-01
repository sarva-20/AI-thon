# Voicepool

Voicepool is a modern, AI-powered audio application that transforms real-time conversations into structured, actionable insights. Built with Next.js, Firebase, and Google's Genkit AI framework, it provides a seamless experience for capturing, transcribing, summarizing, and sharing audio content.

## Features

- **Real-time Audio Transcription:** Push-to-talk functionality with live, speaker-aware transcription powered by Google's cutting-edge speech-to-text models.
- **Secure User Authentication:** Easy and secure sign-up and sign-in using either email and password or Google Sign-In, fully managed by Firebase Authentication.
- **AI-Powered Artifact Generation:** At the end of each session, users can generate a comprehensive "artifact" which includes:
    - A full, speaker-segmented transcript.
    - An AI-generated summary highlighting the most important points.
    - An overall sentiment analysis of the conversation (e.g., Positive, Negative, Neutral).
- **Artifact Management:** A dedicated "My Artifacts" page where users can browse, review, and manage all their past session artifacts.
- **Intelligent Content Sharing:**
    - AI tools generate tailored social media posts from session content for various platforms, including X (Twitter), LinkedIn, Instagram, Threads, Medium, and dev.to.
    - Each post is generated with a tone and format appropriate for the target platform, from the creator's perspective.
    - A built-in editor allows users to review and modify the AI-generated content before copying it to their clipboard.
- **Flexible Data Export:** Users can download their complete session artifacts in multiple formats:
    - **JSON:** A structured file including all metadata, the full transcript, summary, and emotion.
    - **DOCX:** A professionally formatted document, perfect for reports, archives, or sharing with others.
- **Cloud Storage for Audio:** Each audio segment is automatically uploaded and stored securely in Firebase Cloud Storage, with the URL linked in the session artifact for easy access and playback.
- **Modern, Responsive UI:** Built with shadcn/ui and Tailwind CSS, the interface is clean, intuitive, and works beautifully across all devices.

## Getting Started

To run this project locally, you will need to set up your environment and install the required dependencies.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### 1. Set Up Firebase

This project is deeply integrated with Firebase. Before you can run it, you need to create a Firebase project and get your configuration credentials.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  In your project, go to **Project settings** (the gear icon) and select the **General** tab.
4.  Under "Your apps", create a new **Web app** (</>).
5.  After creating the app, Firebase will provide you with a `firebaseConfig` object. Copy these keys.

### 2. Configure Environment Variables

1.  In the root of the project, create a new file named `.env.local`.
2.  Copy the contents of `.env` into your new `.env.local` file.
3.  Paste your Firebase configuration keys into the corresponding variables in `.env.local`. It should look like this:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=1:...
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-...
    ```

4. You will also need to provide an API key for the Genkit AI flows. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey) and add it to `.env.local`:
    ```
    GEMINI_API_KEY=your-gemini-api-key
    ```
    
### 3. Install Dependencies

Open your terminal in the project root and run:

```bash
npm install
```

### 4. Run the Development Server

Once the dependencies are installed, you can start the Next.js development server:

```bash
npm run dev
```

The application will now be running at [http://localhost:9002](http://localhost:9002).

### 5. Start the Genkit AI Flows

For the AI-powered features to work, you also need to run the Genkit development server in a separate terminal:

```bash
npm run genkit:dev
```

This will start the local server for your Genkit flows, allowing the frontend to communicate with them.
