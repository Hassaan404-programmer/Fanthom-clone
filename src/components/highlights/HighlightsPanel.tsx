'use client';

import React, { useState, useEffect } from 'react';
import { Highlight } from '@/types';
import {
  getLocalHighlights,
  saveLocalHighlight,
  deleteLocalHighlight,
} from '@/lib/data';
import { formatSecToTime } from '@/lib/utils';
import {
  Bookmark,
  Plus,
  Trash2,
  Play,
  Sparkles,
  Check,
  Clock,
  Edit3,
} from 'lucide-react';

interface HighlightsPanelProps {
  meetingId: string;
  currentTime: number;
  onSeek: (sec: number) => void;
}

export const HighlightsPanel: React.FC<HighlightsPanelProps> = ({
  meetingId,
  currentTime,
  onSeek,
}) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savedBadge, setSavedBadge] = useState(false);

  // Load highlights from localStorage on mount & when meetingId changes
  useEffect(() => {
    const loaded = getLocalHighlights(meetingId);
    // Sort by timestamp ascending
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
    });

    setHighlights((prev) =>
      [...prev, newHl].sort((a, b) => a.sec - b.sec)
    );
    setNoteText('');
    setIsAdding(false);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const handleDelete = (id: string) => {
    deleteLocalHighlight(id);
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Bookmark className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Bookmarked Highlights
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {highlights.length}
          </span>
        </div>

        <button
          onClick={() => setIsAdding((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Bookmark ({formatSecToTime(currentTime)})</span>
        </button>
      </div>

      {/* Inline Form to Add Highlight */}
      {isAdding && (
        <form
          onSubmit={handleAddHighlight}
          className="p-3.5 rounded-xl bg-slate-50 border border-indigo-200 space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 text-indigo-700">
              <Clock className="w-3.5 h-3.5" /> Bookmark at timestamp{' '}
              <code className="font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                {formatSecToTime(currentTime)}
              </code>
            </span>
          </div>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add key takeaway, decision, or note for this moment..."
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
              Save Highlight
            </button>
          </div>
        </form>
      )}

      {/* Saved Toast Badge */}
      {savedBadge && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Highlight saved to localStorage!</span>
        </div>
      )}

      {/* Highlights List */}
      <div className="space-y-2.5">
        {highlights.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Bookmark className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No highlights added yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click &quot;Bookmark ({formatSecToTime(currentTime)})&quot; to save key moments in localStorage.
            </p>
          </div>
        ) : (
          highlights.map((hl) => (
            <div
              key={hl.id}
              className="group flex items-start justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/60 hover:border-indigo-200 transition-all shadow-2xs"
            >
              <div
                onClick={() => onSeek(hl.sec)}
                className="flex-1 min-w-0 cursor-pointer pr-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-mono font-bold flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    {formatSecToTime(hl.sec)}
                  </span>
                  {hl.createdAt && (
                    <span className="text-[10px] text-slate-400">
                      {new Date(hl.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed group-hover:text-indigo-900 transition-colors">
                  {hl.note}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onSeek(hl.sec)}
                  className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Seek
                </button>
                <button
                  onClick={() => handleDelete(hl.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Highlight"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
