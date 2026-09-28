'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Meeting } from '@/types';
import { formatSecToTime, formatMeetingDate, getSpeakerColorStyle, getInitials } from '@/lib/utils';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Copy,
  Check,
  Sparkles,
  Scissors,
  ArrowRight,
  MessageSquare,
  Clock,
  Video,
} from 'lucide-react';

interface ClipPlayerClientProps {
  meeting: Meeting;
}

export const ClipPlayerClient: React.FC<ClipPlayerClientProps> = ({
  meeting,
}) => {
  const searchParams = useSearchParams();

  // Extract start and end query params with safe fallbacks
  const startParam = Number(searchParams?.get('start')) || 0;
  const endParam = Number(searchParams?.get('end')) || Math.min(meeting.durationSec, startParam + 60);

  const startSec = Math.max(0, startParam);
  const endSec = Math.min(meeting.durationSec, Math.max(startSec + 5, endParam));
  const clipDuration = endSec - startSec;

  const [currentTime, setCurrentTime] = useState<number>(startSec);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const lastTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Filter transcript to segment within clip start/end bounds
  const clipTranscript = useMemo(() => {
    return (meeting.transcript || []).filter((line) => {
      return line.endSec >= startSec && line.startSec <= endSec;
    });
  }, [meeting.transcript, startSec, endSec]);

  // High precision timer restricted to [startSec, endSec]
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
          if (next >= endSec) {
            setIsPlaying(false);
            return startSec; // Loop back to clip start
          }
          return next;
        });
      }
      lastTimeRef.current = now;
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed, startSec, endSec]);

  // Find active line in clip
  const activeLineId = useMemo(() => {
    if (!clipTranscript.length) return null;
    const match = clipTranscript.find(
      (t) => currentTime >= t.startSec && currentTime <= t.endSec
    );
    return match ? match.id : clipTranscript[0].id;
  }, [clipTranscript, currentTime]);

  // Auto scroll active line inside clip transcript
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeLineId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentRelativeSec = currentTime - startSec;
  const progressPercent = clipDuration > 0 ? (currentRelativeSec / clipDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal Public Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-base leading-none">
              Fathom
            </span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">
              Public Meeting Clip
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied Clip Link</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <Link
            href={`/meetings/${meeting.id}`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>View Full Meeting</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Clip Title Banner */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {meeting.meetingType || 'General'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-indigo-500" /> Clip Segment ({formatSecToTime(startSec)} - {formatSecToTime(endSec)})
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {meeting.title}
          </h1>

          <p className="text-xs text-slate-500">
            Recorded on {formatMeetingDate(meeting.date)} • {meeting.participants?.length || 0} Participants
          </p>
        </div>

        {/* Player + Clip Transcript Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Bounded Clip Player */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
              {/* Animated Canvas */}
              <div className="aspect-video w-full rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between p-4 relative overflow-hidden">
                <div className="flex items-center justify-between z-10">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider">
                    Clip Range Playback
                  </span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">
                    {formatSecToTime(currentTime)}
                  </span>
                </div>

                {/* Animated Waveform */}
                <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-xs mx-auto my-auto z-10">
                  {[40, 70, 25, 90, 60, 30, 85, 50, 95, 45, 75, 35, 80].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-purple-400 transition-all"
                      style={{
                        height: isPlaying ? `${Math.max(15, (h * ((i % 3) + 1)) % 100)}%` : '20%',
                        opacity: isPlaying ? 0.9 : 0.4,
                      }}
                    />
                  ))}
                </div>

                <div className="text-xs text-slate-400 truncate font-semibold z-10">
                  Segment: {formatSecToTime(startSec)} to {formatSecToTime(endSec)}
                </div>
              </div>

              {/* Bounded Scrubber Bar */}
              <div className="space-y-1.5">
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                    setCurrentTime(startSec + ratio * clipDuration);
                  }}
                  className="relative h-2.5 w-full bg-slate-800 rounded-full cursor-pointer overflow-hidden"
                >
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-indigo-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{formatSecToTime(currentTime)}</span>
                  <span>{formatSecToTime(endSec)}</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTime(startSec)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Reset clip to start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 transition-transform active:scale-95"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Speed selector */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[1, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                        playbackSpeed === s
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Clip Segment Transcript */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Clip Dialogue Transcript
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {clipTranscript.length} dialogue lines
              </span>
            </div>

            <div
              ref={containerRef}
              className="space-y-3 max-h-[500px] overflow-y-auto pr-1"
            >
              {clipTranscript.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  No transcript lines match this timestamp window.
                </p>
              ) : (
                clipTranscript.map((line) => {
                  const isActive = line.id === activeLineId;
                  const speakerStyle = getSpeakerColorStyle(line.speaker);

                  return (
                    <div
                      key={line.id}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => setCurrentTime(line.startSec)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200/60 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          {line.speaker}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {formatSecToTime(line.startSec)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {line.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
