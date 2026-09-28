'use client';

import React from 'react';
import {
  Menu,
  Search,
  Video,
  Bell,
  Sparkles,
  CheckCircle2,
  Calendar,
  Plus,
} from 'lucide-react';

interface TopBarProps {
  onMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRecordClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMenuToggle,
  searchQuery,
  onSearchChange,
  onRecordClick,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      {/* Left section: Mobile toggle + Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search meetings by title, participant, or summary..."
            className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          ) : (
            <div className="hidden sm:flex absolute inset-y-0 right-0 pr-3 items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* Right section: Calendar Pill + Record CTA + Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4 ml-4">
        {/* Mocked Calendar Sync Indicator Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Calendar Synced</span>
        </div>

        {/* Record / New Meeting CTA Button */}
        <button
          onClick={onRecordClick}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          <Video className="w-4 h-4" />
          <span className="hidden sm:inline">Record Meeting</span>
          <span className="sm:hidden">Record</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => alert('Mock notifications: All recent meetings have been processed & transcribed!')}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};
