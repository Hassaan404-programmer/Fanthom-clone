'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchGlobalMeetings } from '@/lib/data';
import { GlobalSearchResult } from '@/types';
import { formatSecToTime, formatMeetingDate } from '@/lib/utils';
import {
  Search,
  X,
  MessageSquare,
  FileText,
  Clock,
  ChevronRight,
  Sparkles,
  Command,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query & focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  // Execute global search when query updates
  useEffect(() => {
    if (query.trim().length >= 2) {
      const res = searchGlobalMeetings(query);
      setResults(res);
    } else {
      setResults([]);
    }
  }, [query]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectResult = (res: GlobalSearchResult) => {
    onClose();
    const url = res.timestampSec > 0
      ? `/meetings/${res.meetingId}?t=${res.timestampSec}`
      : `/meetings/${res.meetingId}`;
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-indigo-600 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all meetings by title, topic, speaker, or transcript..."
            className="w-full text-sm sm:text-base bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {query.trim().length < 2 ? (
            <div className="py-12 text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-400/80" />
              <p className="text-sm font-semibold text-slate-600">
                Type at least 2 characters to search...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Searches 10+ AI transcribed meetings, summaries, and speaker dialogue.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">
                No results found for &apos;{query}&apos;
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for keywords like &ldquo;latency&rdquo;, &ldquo;sales&rdquo;, &ldquo;architecture&rdquo;, or speaker names.
              </p>
            </div>
          ) : (
            <>
              <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {results.length} Search Matches Found
              </div>
              {results.map((res, index) => (
                <div
                  key={`${res.meetingId}-${res.matchType}-${index}`}
                  onClick={() => handleSelectResult(res)}
                  className="group p-3.5 rounded-xl bg-white hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {res.meetingType}
                      </span>

                      {res.matchType === 'transcript' ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          <MessageSquare className="w-3 h-3" />
                          Transcript match
                        </span>
                      ) : res.matchType === 'summary' ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <FileText className="w-3 h-3" />
                          Summary match
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          Title match
                        </span>
                      )}
                    </div>

                    {res.timestampSec > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-mono font-bold">
                        Seek to {formatSecToTime(res.timestampSec)}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {res.meetingTitle}
                  </h4>

                  {res.speaker && (
                    <div className="text-[11px] font-semibold text-indigo-600 mt-0.5">
                      Speaker: {res.speaker}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed italic bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                    &ldquo;{res.snippet}&rdquo;
                  </p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press ESC to close</span>
          <span>Click any match to navigate & seek</span>
        </div>
      </div>
    </div>
  );
};
