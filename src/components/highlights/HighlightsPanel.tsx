'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Highlight, AnnotationType, TranscriptLine, Participant } from '@/types';
import {
  getLocalHighlights,
  saveLocalHighlight,
  deleteLocalHighlight,
} from '@/lib/data';
import { formatSecToTime, getSpeakerColorStyle } from '@/lib/utils';
import {
  Bookmark,
  Plus,
  Trash2,
  Play,
  Sparkles,
  Check,
  Clock,
  FileText,
  MessageSquare,
  User,
} from 'lucide-react';

interface HighlightsPanelProps {
  meetingId: string;
  currentTime: number;
  onSeek: (sec: number) => void;
  transcript?: TranscriptLine[];
  participants?: Participant[];
}

export const HighlightsPanel: React.FC<HighlightsPanelProps> = ({
  meetingId,
  currentTime,
  onSeek,
  transcript = [],
  participants = [],
}) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [annotationType, setAnnotationType] = useState<AnnotationType>('highlight');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [savedBadge, setSavedBadge] = useState(false);

  // Auto-detect current speaker at currentTime
  const currentSpeaker = useMemo(() => {
    if (!transcript || transcript.length === 0) {
      return participants[0]?.name || 'Speaker';
    }
    const activeLine = transcript.find(
      (t) => currentTime >= t.startSec && currentTime <= t.endSec
    );
    if (activeLine?.speaker) return activeLine.speaker;

    // Fallback to nearest preceding line speaker
    let nearest = transcript[0]?.speaker || 'Speaker';
    for (const t of transcript) {
      if (t.startSec <= currentTime) {
        nearest = t.speaker;
      } else {
        break;
      }
    }
    return nearest;
  }, [transcript, participants, currentTime]);

  // Sync selectedSpeaker state when active speaker changes or form opens
  useEffect(() => {
    if (!selectedSpeaker || !isAdding) {
      setSelectedSpeaker(currentSpeaker);
    }
  }, [currentSpeaker, isAdding, selectedSpeaker]);

  // Load highlights from localStorage on mount & when meetingId changes
  useEffect(() => {
    const loaded = getLocalHighlights(meetingId);
    const sorted = [...loaded].sort((a, b) => a.sec - b.sec);
    setHighlights(sorted);
  }, [meetingId]);

  const handleAddHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newHl = saveLocalHighlight({
      meetingId,
      sec: Math.floor(currentTime),
      note: noteText.trim(),
      type: annotationType,
      speaker: selectedSpeaker || currentSpeaker,
    });

    setHighlights((prev) => [...prev, newHl].sort((a, b) => a.sec - b.sec));
    setNoteText('');
    setIsAdding(false);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const handleDelete = (id: string) => {
    deleteLocalHighlight(id);
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  // Get unique speakers list for form dropdown
  const speakerOptions = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => set.add(p.name));
    transcript.forEach((t) => {
      if (t.speaker) set.add(t.speaker);
    });
    return Array.from(set);
  }, [participants, transcript]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Bookmark className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Bookmarked Highlights & Notes
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {highlights.length}
          </span>
        </div>

        <button
          onClick={() => {
            setIsAdding((prev) => !prev);
            setSelectedSpeaker(currentSpeaker);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Annotation ({formatSecToTime(currentTime)})</span>
        </button>
      </div>

      {/* Inline Form to Add Annotation */}
      {isAdding && (
        <form
          onSubmit={handleAddHighlight}
          className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-3.5 animate-fade-in shadow-2xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 text-indigo-700">
              <Clock className="w-3.5 h-3.5" /> Moment at{' '}
              <code className="font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                {formatSecToTime(currentTime)}
              </code>
            </span>

            {/* Type Selector (Highlight vs Note) */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-lg">
              <button
                type="button"
                onClick={() => setAnnotationType('highlight')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  annotationType === 'highlight'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Highlight</span>
              </button>

              <button
                type="button"
                onClick={() => setAnnotationType('note')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  annotationType === 'note'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Note</span>
              </button>
            </div>
          </div>

          {/* Speaker Selector */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <User className="w-3 h-3" /> Speaker:
            </label>
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {speakerOptions.map((spk) => (
                <option key={spk} value={spk}>
                  {spk}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={
              annotationType === 'highlight'
                ? 'Add key takeaway or highlight moment...'
                : 'Add personal note or observation...'
            }
            rows={2}
            className="w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            autoFocus
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!noteText.trim()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs disabled:opacity-50"
            >
              Save {annotationType === 'highlight' ? 'Highlight' : 'Note'}
            </button>
          </div>
        </form>
      )}

      {/* Saved Toast Badge */}
      {savedBadge && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Annotation saved!</span>
        </div>
      )}

      {/* Highlights & Notes List */}
      <div className="space-y-2.5">
        {highlights.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Bookmark className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No highlights or notes saved yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click &quot;Add Annotation ({formatSecToTime(currentTime)})&quot; to bookmark key moments.
            </p>
          </div>
        ) : (
          highlights.map((hl) => {
            const isHighlightType = hl.type === 'highlight' || !hl.type;
            const speakerStyle = getSpeakerColorStyle(hl.speaker || 'Speaker');

            return (
              <div
                key={hl.id}
                className={`group flex items-start justify-between p-3.5 rounded-xl border transition-all shadow-2xs ${
                  isHighlightType
                    ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                    : 'bg-indigo-50/40 border-indigo-200/80 hover:border-indigo-300'
                }`}
              >
                <div
                  onClick={() => onSeek(hl.sec)}
                  className="flex-1 min-w-0 cursor-pointer pr-3 space-y-1.5"
                >
                  {/* Metadata Row: Type Badge + Speaker Badge + Timestamp Seek */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Type Badge */}
                    {isHighlightType ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                        <span>Highlight</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold">
                        <FileText className="w-3 h-3 text-indigo-600" />
                        <span>Note</span>
                      </span>
                    )}

                    {/* Speaker Badge */}
                    {hl.speaker && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${speakerStyle.bg} ${speakerStyle.text} border ${speakerStyle.border}`}
                      >
                        {hl.speaker}
                      </span>
                    )}

                    {/* Play Timestamp Seek Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(hl.sec);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-indigo-600 transition-colors"
                      title={`Seek to ${formatSecToTime(hl.sec)}`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      {formatSecToTime(hl.sec)}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                    {hl.note}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDelete(hl.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Annotation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
