import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fathom Clone - AI Meeting Notetaker',
  description: 'AI meeting notetaker with real-time transcripts, summaries, and highlights',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
