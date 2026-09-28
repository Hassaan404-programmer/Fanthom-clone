import React from 'react';
import Link from 'next/link';
import { getMeetingById } from '@/lib/data';
import { AppShell } from '@/components/layout/AppShell';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  FileText,
  Sparkles,
  Info,
  Users,
} from 'lucide-react';
import { formatDuration, formatMeetingDate, getInitials } from '@/lib/utils';

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingDetailPage({ params }: MeetingPageProps) {
  const { id } = await params;
  const meeting = getMeetingById(id);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Meetings</span>
        </Link>

        {/* Placeholder Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              Placeholder Meeting View (Step 2)
            </h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              You clicked meeting ID: <code className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded font-bold">{id}</code>.
              The complete meeting view with interactive video player, AI summary tabs, synchronized transcript, and custom highlight creation will be fully built in Step 3.
            </p>
          </div>
        </div>

        {/* Meeting Header Preview Card */}
        {meeting ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {meeting.meetingType}
              </span>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatMeetingDate(meeting.date)}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">
                {formatDuration(meeting.durationSec)}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {meeting.title}
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Hosted by {meeting.participants[0]?.name || 'Fathom AI'} • {meeting.participants.length} Participants
              </p>
            </div>

            {/* Participants */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                Participants ({meeting.participants.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {getInitials(p.name)}
                    </div>
                    <span>{p.name}</span>
                    <span className="text-[10px] text-slate-400">({p.role})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Teaser */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Executive Summary Excerpt
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60 italic">
                &ldquo;{meeting.summaries.general}&rdquo;
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-600 font-semibold">Meeting with ID &quot;{id}&quot; not found in seed dataset.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
