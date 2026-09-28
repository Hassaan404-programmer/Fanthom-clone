import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fathom - AI Meeting Notetaker',
  description: 'AI meeting notetaker with real-time transcripts, summaries, and highlights',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
