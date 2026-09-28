import React from 'react';
import { getMeetingById } from '@/lib/data';
import { MeetingDetailClient } from '@/components/meetings/MeetingDetailClient';
import { AppShell } from '@/components/layout/AppShell';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingDetailPage({ params }: MeetingPageProps) {
  const { id } = await params;
  const meeting = getMeetingById(id);

  if (!meeting) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900">Meeting Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            No meeting exists with ID &quot;<span className="font-mono text-slate-700">{id}</span>&quot;.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Meetings List</span>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return <MeetingDetailClient meeting={meeting} />;
}
