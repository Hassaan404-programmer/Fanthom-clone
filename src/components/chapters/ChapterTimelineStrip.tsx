'use client';

import React from 'react';
import { Chapter } from '@/types';
import { formatSecToTime } from '@/lib/utils';
import { Bookmark, Clock, ChevronRight } from 'lucide-react';

interface ChapterTimelineStripProps {
  chapters: Chapter[];
  currentTime: number;
  durationSec: number;
  onSeek: (timeSec: number) => void;
}

export const ChapterTimelineStrip: React.FC<ChapterTimelineStripProps> = ({
  chapters = [],
  currentTime,
  durationSec,
  onSeek,
}) => {
  if (!chapters || chapters.length === 0) return null;

  // Find active chapter index
  const activeChapterIndex = chapters.findIndex(
    (c) => currentTime >= c.startSec && currentTime <= c.endSec
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3 mb-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Bookmark className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Meeting Agenda & Chapter Timeline
          </h3>
        </div>

        <span className="text-[11px] font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
          {chapters.length} Chapters
        </span>
      </div>

      {/* Horizontal Scrollable Timeline Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
        {chapters.map((ch, idx) => {
          const isActive = idx === activeChapterIndex;
          const isPast = currentTime > ch.endSec;

          return (
            <button
              key={ch.id}
              onClick={() => onSeek(ch.startSec)}
              className={`flex flex-col min-w-[200px] sm:min-w-[220px] p-3 rounded-xl border text-left transition-all shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                  : isPast
                  ? 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                  : 'bg-white text-slate-800 border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 w-full">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {formatSecToTime(ch.startSec)}
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isActive ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  Ch {idx + 1}
                </span>
              </div>

              <h4
                className={`text-xs font-bold line-clamp-1 leading-snug ${
                  isActive ? 'text-white' : 'text-slate-900'
                }`}
              >
                {ch.title}
              </h4>
            </button>
          );
        })}
      </div>
    </div>
  );
};
