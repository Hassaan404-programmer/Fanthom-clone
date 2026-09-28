'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TranscriptLine, Participant } from '@/types';
import {
  formatSecToTime,
  getSpeakerColorStyle,
  getInitials,
} from '@/lib/utils';
import {
  Search,
  Users,
  MessageSquare,
  ArrowDownCircle,
  Sparkles,
  Filter,
  X,
} from 'lucide-react';

interface TranscriptPanelProps {
  transcript: TranscriptLine[];
  participants: Participant[];
  currentTime: number;
  onSeek: (timeSec: number) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcript = [],
  participants = [],
  currentTime,
  onSeek,
}) => {
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Extract unique speakers list from transcript lines + participant data
  const speakers = useMemo(() => {
    const set = new Set<string>();
    transcript.forEach((t) => {
      if (t.speaker) set.add(t.speaker);
    });
    return Array.from(set);
  }, [transcript]);

  // Find active line based on currentTime
  const activeLineId = useMemo(() => {
    if (!transcript.length) return null;
    const match = transcript.find(
      (t) => currentTime >= t.startSec && currentTime <= t.endSec
    );
    if (match) return match.id;

    // Fallback to closest preceding line
    let closestId = transcript[0].id;
    for (const t of transcript) {
      if (t.startSec <= currentTime) {
        closestId = t.id;
      } else {
        break;
      }
    }
    return closestId;
  }, [transcript, currentTime]);

  // Filter transcript lines based on speaker chip selection and search query
  const filteredTranscript = useMemo(() => {
    return transcript.filter((item) => {
      if (selectedSpeaker !== 'ALL' && item.speaker !== selectedSpeaker) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch = item.text.toLowerCase().includes(q);
        const speakerMatch = item.speaker.toLowerCase().includes(q);
        return textMatch || speakerMatch;
      }
      return true;
    });
  }, [transcript, selectedSpeaker, searchQuery]);

  // Auto-scroll active line into view when currentTime changes and auto-scroll is enabled
  useEffect(() => {
    if (!isAutoScrollEnabled || !activeLineRef.current || !containerRef.current) return;
    activeLineRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [activeLineId, isAutoScrollEnabled]);

  // Handle user manual scroll inside container to temporarily pause auto-scroll
  const handleScroll = () => {
    if (!containerRef.current || !activeLineRef.current) return;
    const container = containerRef.current;
    const activeEl = activeLineRef.current;

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const activeTop = activeEl.offsetTop - container.offsetTop;
    const activeBottom = activeTop + activeEl.clientHeight;

    const isVisible = activeTop >= containerTop && activeBottom <= containerBottom;
    if (!isVisible) {
      setIsAutoScrollEnabled(false);
    }
  };

  const resumeAutoScroll = () => {
    setIsAutoScrollEnabled(true);
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] sm:h-[750px] overflow-hidden relative">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Live Transcript
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {filteredTranscript.length} / {transcript.length} lines
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Click line to seek
          </div>
        </div>

        {/* Search input field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript keyword or topic..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Speaker Filter Chips Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedSpeaker('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSpeaker === 'ALL'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Speakers ({speakers.length})
          </button>

          {speakers.map((spk) => {
            const isSelected = selectedSpeaker === spk;
            const style = getSpeakerColorStyle(spk);
            const lineCount = transcript.filter((t) => t.speaker === spk).length;
            return (
              <button
                key={spk}
                onClick={() => setSelectedSpeaker(spk)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? `${style.bg} ${style.text} ${style.border} ring-2 ${style.ring}`
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span>{spk}</span>
                <span className="text-[10px] opacity-75 font-mono">({lineCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transcript Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scroll-smooth"
      >
        {filteredTranscript.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <Search className="w-8 h-8 mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No transcript matches found.</p>
            <p className="text-[11px] text-slate-400 mt-1">Try clearing your speaker filter or search query.</p>
          </div>
        ) : (
          filteredTranscript.map((line) => {
            const isActive = line.id === activeLineId;
            const speakerStyle = getSpeakerColorStyle(line.speaker);
            const initials = getInitials(line.speaker);

            return (
              <div
                key={line.id}
                ref={isActive ? activeLineRef : null}
                onClick={() => {
                  onSeek(line.startSec);
                  setIsAutoScrollEnabled(true);
                }}
                className={`group cursor-pointer p-3.5 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {/* Header: Speaker Badge + Timestamp */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Avatar Initials */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs ${speakerStyle.avatarBg}`}
                    >
                      {initials}
                    </div>

                    <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {line.speaker}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700 text-[10px] font-mono font-bold transition-colors">
                    {formatSecToTime(line.startSec)}
                  </span>
                </div>

                {/* Spoken Text */}
                <p className={`text-xs sm:text-sm leading-relaxed pl-8 ${
                  isActive ? 'text-slate-900 font-medium' : 'text-slate-700'
                }`}>
                  {line.text}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Auto-scroll Resume Button */}
      {!isAutoScrollEnabled && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={resumeAutoScroll}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all animate-bounce"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Resume Auto-Scroll</span>
          </button>
        </div>
      )}
    </div>
  );
};
