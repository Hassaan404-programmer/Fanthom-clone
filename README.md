# Fathom AI Meeting Notetaker Clone

A Next.js (App Router) + TypeScript + Tailwind CSS web application cloning core features of [Fathom.video](https://fathom.video) - the AI meeting assistant.

> **Disclaimer**: The meeting recording bot in this application is **faked/simulated** for demonstration purposes. Real-time audio ingestion and bot attendance are simulated using rich pre-seeded meeting datasets and client-side playback state. User actions like highlights and custom notes are persisted in browser `localStorage`.

## Features Planned
- **Dashboard & Video Player**: Synchronized interactive video playback, timestamped transcripts, chapter navigation, and highlights.
- **AI Summary Templates**: Dynamic summary views (General, Sales, 1:1, Standup, Action Items).
- **Interactive Highlighting & Notes**: Instant highlight bookmarks persisted locally.
- **Faked Recording Bot**: Simulated bot joining meetings with real-time transcript streaming.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel ready (zero external database required)

## Getting Started
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
