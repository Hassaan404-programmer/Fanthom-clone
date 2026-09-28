'use client';

import React from 'react';
import { SearchX, RefreshCcw, Video } from 'lucide-react';

interface EmptyStateProps {
  searchQuery?: string;
  selectedCategory?: string;
  onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery = '',
  selectedCategory = 'All',
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs my-6">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-2xs">
        <SearchX className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
        No meetings found
      </h3>

      <p className="text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">
        {searchQuery ? (
          <>
            No calls or transcripts matching &ldquo;<span className="font-semibold text-slate-700">{searchQuery}</span>&rdquo;.
          </>
        ) : (
          <>No recorded meetings match the selected category &ldquo;<span className="font-semibold text-slate-700">{selectedCategory}</span>&rdquo;.</>
        )}
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Clear Filters</span>
        </button>

        <button
          onClick={() =>
            alert(
              '🎥 Record Meeting\n\nConnect Zoom or Google Meet to automatically start recording new meetings!'
            )
          }
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-colors"
        >
          <Video className="w-4 h-4" />
          <span>Record New Meeting</span>
        </button>
      </div>
    </div>
  );
};
