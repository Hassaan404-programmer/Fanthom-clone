'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Meeting } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { MeetingPlayer } from '@/components/player/MeetingPlayer';
import { SummaryPanel } from '@/components/summary/SummaryPanel';
import { TranscriptPanel } from '@/components/transcript/TranscriptPanel';
import { formatDuration, formatMeetingDate } from '@/lib/utils';
import {
  ArrowLeft,
  Clock,
  Video,
  FileText,
  MessageSquare,
  Sparkles,
  Share2,
  Bookmark,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface MeetingDetailClientProps {
  meeting: Meeting;
}

export const MeetingDetailClient: React.FC<MeetingDetailClientProps> = ({
  meeting,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<'transcript' | 'summary'>('transcript');
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const durationSec = meeting.durationSec || 3600;

  // Animation frame / High resolution timer driven player
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    let animationFrameId: number;

    const step = (now: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (now - lastTimeRef.current) / 1000;
        setCurrentTime((prev) => {
          const next = prev + deltaSec * playbackSpeed;
          if (next >= durationSec) {
            setIsPlaying(false);
            return durationSec;
          }
          return next;
        });
      }
      lastTimeRef.current = now;
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed, durationSec]);

  // Keyboard shortcut listener (Space = play/pause, Left/Right = seek -10s/+10s)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 10));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((prev) => Math.min(durationSec, prev + 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [durationSec]);

  const handleSeek = useCallback(
    (timeSec: number) => {
      const clamped = Math.max(0, Math.min(durationSec, timeSec));
      setCurrentTime(clamped);
    },
    [durationSec]
  );

  const handleShareClick = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Row: Back Link + Title + Meta + Share CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>All Meetings</span>
              </Link>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {meeting.meetingType || 'General'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {meeting.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatMeetingDate(meeting.date)}
              </span>
              <span>•</span>
              <span className="font-mono">{formatDuration(meeting.durationSec)}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                {meeting.participants?.length || 0} Participants
              </span>
            </div>
          </div>

          {/* Share / Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleShareClick}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              {copiedShare ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Share Meeting</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Tab Controls (< lg screens) */}
        <div className="lg:hidden flex items-center p-1 bg-slate-200/70 rounded-xl border border-slate-300/60">
          <button
            onClick={() => setMobileTab('transcript')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              mobileTab === 'transcript'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Transcript ({meeting.transcript?.length || 0})</span>
          </button>
          <button
            onClick={() => setMobileTab('summary')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              mobileTab === 'summary'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Summary & Action Items</span>
          </button>
        </div>

        {/* Core Layout: Player + Summary (Left) & Transcript (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Player (sticky) + Summary Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="lg:sticky lg:top-20 z-20 space-y-6">
              <MeetingPlayer
                meetingTitle={meeting.title}
                durationSec={durationSec}
                currentTime={currentTime}
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                chapters={meeting.chapters || []}
                onTogglePlay={() => setIsPlaying((prev) => !prev)}
                onSeek={handleSeek}
                onChangeSpeed={setPlaybackSpeed}
              />
            </div>

            {/* Desktop or Mobile Summary Tab */}
            <div className={`space-y-6 ${mobileTab === 'transcript' ? 'hidden lg:block' : 'block'}`}>
              <SummaryPanel
                summaries={meeting.summaries}
                chapters={meeting.chapters || []}
                participants={meeting.participants || []}
                onSeek={handleSeek}
              />
            </div>
          </div>

          {/* Right Column: Transcript Panel */}
          <div
            className={`lg:col-span-7 ${
              mobileTab === 'summary' ? 'hidden lg:block' : 'block'
            }`}
          >
            <TranscriptPanel
              transcript={meeting.transcript || []}
              participants={meeting.participants || []}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
};
