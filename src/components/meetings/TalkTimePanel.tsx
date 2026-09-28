'use client';

import React, { useState, useMemo } from 'react';
import { TranscriptLine } from '@/types';
import { getSpeakerColorStyle, formatSecToTime } from '@/lib/utils';
import { Mic, ChevronDown, ChevronUp, Clock, BarChart2 } from 'lucide-react';

interface TalkTimePanelProps {
  transcript: TranscriptLine[];
  onSeek?: (timeSec: number) => void;
  className?: string;
}

export interface SpeakerTalkStat {
  speaker: string;
  seconds: number;
  percentage: number;
  displayPercentage: string;
  colorStyle: ReturnType<typeof getSpeakerColorStyle>;
  firstSec: number;
}

export const TalkTimePanel: React.FC<TalkTimePanelProps> = ({
  transcript = [],
  onSeek,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Compute speaker talk times from transcript line durations
  const { stats, totalSpokenSec } = useMemo(() => {
    if (!transcript || transcript.length === 0) {
      return { stats: [], totalSpokenSec: 0 };
    }

    const speakerSecMap: Record<string, number> = {};
    const firstSecMap: Record<string, number> = {};
    let grandTotal = 0;

    transcript.forEach((line) => {
      if (!line.speaker) return;
      const duration = Math.max(0, line.endSec - line.startSec);
      speakerSecMap[line.speaker] = (speakerSecMap[line.speaker] || 0) + duration;
      grandTotal += duration;

      if (firstSecMap[line.speaker] === undefined) {
        firstSecMap[line.speaker] = line.startSec;
      }
    });

    if (grandTotal === 0) {
      return { stats: [], totalSpokenSec: 0 };
    }

    const calculatedStats: SpeakerTalkStat[] = Object.entries(speakerSecMap)
      .map(([speaker, seconds]) => {
        const rawPct = (seconds / grandTotal) * 100;
        return {
          speaker,
          seconds,
          percentage: rawPct,
          displayPercentage: rawPct < 1 && rawPct > 0 ? '<1%' : `${Math.round(rawPct)}%`,
          colorStyle: getSpeakerColorStyle(speaker),
          firstSec: firstSecMap[speaker] || 0,
        };
      })
      .sort((a, b) => b.seconds - a.seconds);

    return { stats: calculatedStats, totalSpokenSec: grandTotal };
  }, [transcript]);

  if (stats.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4 transition-all ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Mic className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Talk Time
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {formatSecToTime(totalSpokenSec)} spoken
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand Talk Time' : 'Collapse Talk Time'}
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main Collapsible Content */}
      {!isCollapsed && (
        <div className="space-y-3.5 animate-fade-in">
          {/* Proportional Segmented Bar */}
          <div className="space-y-1.5">
            <div className="h-3.5 sm:h-4 w-full bg-slate-100 rounded-full flex overflow-hidden p-0.5 gap-0.5 border border-slate-200/80 shadow-inner">
              {stats.map((item) => (
                <div
                  key={item.speaker}
                  style={{ width: `${Math.max(item.percentage, 2)}%` }}
                  onClick={() => onSeek && onSeek(item.firstSec)}
                  title={`${item.speaker}: ${item.displayPercentage} (${formatSecToTime(item.seconds)})`}
                  className={`${item.colorStyle.dot} h-full transition-all duration-300 hover:opacity-85 cursor-pointer relative group rounded-xs`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-0.5">
              <span>Speaker distribution</span>
              <span>Click speaker to seek</span>
            </div>
          </div>

          {/* Speaker Breakdown List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {stats.map((item) => (
              <button
                key={item.speaker}
                onClick={() => onSeek && onSeek(item.firstSec)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/60 hover:border-indigo-200 text-left transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.colorStyle.dot}`} />
                  <span className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                    {item.speaker}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-mono font-semibold text-slate-500">
                    {formatSecToTime(item.seconds)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${item.colorStyle.bg} ${item.colorStyle.text} border ${item.colorStyle.border}`}
                  >
                    {item.displayPercentage}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
