'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Meeting } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { MeetingPlayer } from '@/components/player/MeetingPlayer';
import { SummaryPanel } from '@/components/summary/SummaryPanel';
import { TranscriptPanel } from '@/components/transcript/TranscriptPanel';
import { HighlightsPanel } from '@/components/highlights/HighlightsPanel';
import { ClipCreatorModal } from '@/components/clip/ClipCreatorModal';
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
  Scissors,
} from 'lucide-react';

interface MeetingDetailClientProps {
  meeting: Meeting;
}

export const MeetingDetailClient: React.FC<MeetingDetailClientProps> = ({
  meeting,
}) => {
  const searchParams = useSearchParams();
  const initialTime = Number(searchParams?.get('t')) || 0;

  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<'transcript' | 'summary' | 'highlights'>('transcript');
  const [activeLeftTab, setActiveLeftTab] = useState<'summary' | 'highlights'>('summary');
  const [isClipModalOpen, setIsClipModalOpen] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const durationSec = meeting.durationSec || 3600;
  const lastTimeRef = useRef<number | null>(null);

  // Sync seek param from URL on load
  useEffect(() => {
    const t = searchParams?.get('t');
    if (t) {
      const parsed = Number(t);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= durationSec) {
        setCurrentTime(parsed);
      }
    }
  }, [searchParams, durationSec]);

  // High precision timer-driven player
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
        {/* Top Header Row: Back Link + Title + Meta + Share & Create Clip CTAs */}
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

          {/* Share & Create Clip CTAs */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsClipModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs sm:text-sm font-bold transition-colors shadow-2xs"
            >
              <Scissors className="w-4 h-4 text-indigo-600" />
              <span>Share Clip</span>
            </button>

            <button
              onClick={handleShareClick}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              {copiedShare ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Tab Controls (< lg screens) */}
        <div className="lg:hidden flex items-center p-1 bg-slate-200/70 rounded-xl border border-slate-300/60">
          <button
            onClick={() => setMobileTab('transcript')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              mobileTab === 'transcript'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Transcript</span>
          </button>
          <button
            onClick={() => setMobileTab('summary')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              mobileTab === 'summary'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>
          <button
            onClick={() => setMobileTab('highlights')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              mobileTab === 'highlights'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Highlights</span>
          </button>
        </div>

        {/* Core Layout: Player + Left Panel (Summary/Highlights) & Transcript (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Player (sticky) + Tabbed Summary/Highlights Panel */}
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

            {/* Desktop Left Tab Switcher (Summary vs Highlights) */}
            <div className="hidden lg:flex items-center gap-2 p-1 bg-slate-200/70 rounded-xl border border-slate-300/60">
              <button
                onClick={() => setActiveLeftTab('summary')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeLeftTab === 'summary'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>AI Summary & Action Items</span>
              </button>
              <button
                onClick={() => setActiveLeftTab('highlights')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeLeftTab === 'highlights'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>Bookmarked Highlights</span>
              </button>
            </div>

            {/* Content rendering based on Tab */}
            <div className="space-y-6">
              {/* Summary View */}
              <div
                className={`${
                  mobileTab === 'summary' || activeLeftTab === 'summary'
                    ? 'block'
                    : 'hidden lg:hidden'
                }`}
              >
                <SummaryPanel
                  summaries={meeting.summaries}
                  chapters={meeting.chapters || []}
                  participants={meeting.participants || []}
                  onSeek={handleSeek}
                />
              </div>

              {/* Highlights View */}
              <div
                className={`${
                  mobileTab === 'highlights' || activeLeftTab === 'highlights'
                    ? 'block'
                    : 'hidden lg:hidden'
                }`}
              >
                <HighlightsPanel
                  meetingId={meeting.id}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Transcript Panel */}
          <div
            className={`lg:col-span-7 ${
              mobileTab === 'summary' || mobileTab === 'highlights'
                ? 'hidden lg:block'
                : 'block'
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

      {/* Clip Sharing Modal */}
      <ClipCreatorModal
        isOpen={isClipModalOpen}
        onClose={() => setIsClipModalOpen(false)}
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        durationSec={durationSec}
        currentTime={currentTime}
      />
    </AppShell>
  );
};
