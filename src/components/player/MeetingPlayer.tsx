'use client';

import React, { useState, useRef } from 'react';
import { Chapter } from '@/types';
import { formatSecToTime } from '@/lib/utils';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Bookmark,
  Sliders,
  Layers,
} from 'lucide-react';

interface MeetingPlayerProps {
  meetingTitle: string;
  durationSec: number;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  chapters: Chapter[];
  onTogglePlay: () => void;
  onSeek: (timeSec: number) => void;
  onChangeSpeed: (speed: number) => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

export const MeetingPlayer: React.FC<MeetingPlayerProps> = ({
  meetingTitle,
  durationSec,
  currentTime,
  isPlaying,
  playbackSpeed,
  chapters = [],
  onTogglePlay,
  onSeek,
  onChangeSpeed,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverChapter, setHoverChapter] = useState<Chapter | null>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  // Find active chapter based on currentTime
  const activeChapter = chapters.find(
    (c) => currentTime >= c.startSec && currentTime <= c.endSec
  ) || chapters[0];

  // Calculate percentage
  const progressPercent = durationSec > 0 ? (currentTime / durationSec) * 100 : 0;

  // Handle scrubber click or drag
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || durationSec <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * durationSec);
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || durationSec <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
    const targetSec = ratio * durationSec;
    setHoverTime(targetSec);

    // Find chapter hovered
    const ch = chapters.find(
      (c) => targetSec >= c.startSec && targetSec <= c.endSec
    );
    setHoverChapter(ch || null);
  };

  const handleScrubberMouseLeave = () => {
    setHoverTime(null);
    setHoverChapter(null);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
      {/* Top Banner: Video Canvas Mock with Animated Audio Waveform */}
      <div className="relative aspect-video w-full rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden flex flex-col justify-between p-4 mb-4 group">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

        {/* Header Overlay inside player screen */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-200">
              Mock AI Recording
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeChapter && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold backdrop-blur-md">
                <Bookmark className="w-3 h-3 text-indigo-400" />
                <span className="truncate max-w-[200px]">{activeChapter.title}</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Audio Visualizer / Animated Waveform */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-xs px-4">
            {[40, 70, 25, 90, 60, 30, 85, 50, 95, 45, 75, 35, 80, 65, 30, 90, 50].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 via-purple-400 to-indigo-300 transition-all duration-150"
                style={{
                  height: isPlaying ? `${Math.max(15, (h * ((i % 3) + 1)) % 100)}%` : '20%',
                  opacity: isPlaying ? 0.9 : 0.4,
                  animation: isPlaying ? `pulse 1.${(i % 5) + 2}s infinite alternate` : 'none',
                }}
              />
            ))}
          </div>

          <p className="text-xs font-medium text-slate-400 mt-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fathom Smart Player & Transcriber</span>
          </p>
        </div>

        {/* Bottom Title Overlay */}
        <div className="relative z-10 flex items-center justify-between pt-2">
          <div className="truncate max-w-[80%]">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
              {meetingTitle}
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400">
            {formatSecToTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Interactive Scrubber Bar with Chapter Markers */}
      <div className="space-y-2 mb-4">
        {/* Scrubber Container */}
        <div
          ref={scrubberRef}
          onClick={handleScrubberClick}
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={handleScrubberMouseLeave}
          className="relative h-3 w-full bg-slate-800 hover:bg-slate-700/80 rounded-full cursor-pointer transition-colors group/scrubber"
        >
          {/* Progress fill */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full pointer-events-none"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Hover highlight bar */}
          {hoverTime !== null && (
            <div
              className="absolute top-0 bottom-0 left-0 bg-indigo-400/30 rounded-full pointer-events-none"
              style={{ width: `${(hoverTime / durationSec) * 100}%` }}
            />
          )}

          {/* Scrubber Handle thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-indigo-600 scale-90 group-hover/scrubber:scale-125 transition-transform pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          />

          {/* Chapter Markers on the scrubber track */}
          {chapters.map((chapter) => {
            const markerPercent = (chapter.startSec / durationSec) * 100;
            return (
              <div
                key={chapter.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(chapter.startSec);
                }}
                title={`Chapter: ${chapter.title} (${formatSecToTime(chapter.startSec)})`}
                className="absolute top-0 bottom-0 w-1 bg-white/70 hover:bg-yellow-400 z-10 transition-colors cursor-pointer"
                style={{ left: `${markerPercent}%` }}
              />
            );
          })}

          {/* Hover tooltip for time and chapter */}
          {hoverTime !== null && (
            <div
              className="absolute bottom-5 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-mono border border-slate-700 shadow-lg pointer-events-none whitespace-nowrap z-30"
              style={{
                left: `${Math.max(10, Math.min(90, (hoverTime / durationSec) * 100))}%`,
              }}
            >
              <span>{formatSecToTime(hoverTime)}</span>
              {hoverChapter && (
                <span className="text-indigo-300 ml-1.5 font-sans font-medium">
                  • {hoverChapter.title}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Time Labels */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{formatSecToTime(currentTime)}</span>
          <span>{formatSecToTime(durationSec)}</span>
        </div>
      </div>

      {/* Control Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Skip back, Play/Pause, Skip forward */}
        <div className="flex items-center gap-2">
          {/* Skip -10s */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 10))}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Skip back 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play/Pause CTA */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Skip +10s */}
          <button
            onClick={() => onSeek(Math.min(durationSec, currentTime + 10))}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Skip forward 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Playback Speed Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1.5">
            Speed
          </span>
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              onClick={() => onChangeSpeed(speed)}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-colors ${
                playbackSpeed === speed
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Right: Mute toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
