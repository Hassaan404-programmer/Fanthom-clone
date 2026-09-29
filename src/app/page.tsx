'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GoogleCalendarBanner } from '@/components/meetings/GoogleCalendarBanner';
import { MeetingGroup } from '@/components/meetings/MeetingGroup';
import { MeetingListSkeleton } from '@/components/meetings/MeetingListSkeleton';
import { EmptyState } from '@/components/meetings/EmptyState';
import { getMeetings } from '@/lib/data';
import { groupMeetingsByDate } from '@/lib/utils';
import { Meeting } from '@/types';
import { Filter, Sparkles, Video, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Sales',
  '1:1',
  'Standup',
  'Product',
  'Engineering',
  'Executive',
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Load meetings and simulate light loading skeleton on mount/reset
  useEffect(() => {
    const data = getMeetings();
    setMeetings(data);
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  // Filter meetings based on search input and category pill selection
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      // Category filter
      if (
        selectedCategory !== 'All' &&
        m.meetingType?.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (m.title ?? '').toLowerCase().includes(q);
      const matchParticipant = m.participants.some(
        (p) =>
          (p.name ?? '').toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q)
      );
      const matchSummary = (m.summaries?.general ?? '').toLowerCase().includes(q);
      return matchTitle || matchParticipant || matchSummary;
    });
  }, [meetings, searchQuery, selectedCategory]);

  // Group meetings into Today, Yesterday, Earlier
  const grouped = useMemo(() => {
    return groupMeetingsByDate(filteredMeetings);
  }, [filteredMeetings]);

  const hasAnyMeetings =
    grouped.today.length > 0 ||
    grouped.yesterday.length > 0 ||
    grouped.earlier.length > 0;

  return (
    <AppShell searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      {/* Top Banner: Google Calendar Connected (Mocked) */}
      <GoogleCalendarBanner />

      {/* Main Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meetings & Transcripts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse AI-generated summaries, action items, and full recordings.
          </p>
        </div>

        {/* Count pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
            {filteredMeetings.length} {filteredMeetings.length === 1 ? 'Meeting' : 'Meetings'}
          </span>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase pr-2 border-r border-slate-200 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filter</span>
        </div>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <MeetingListSkeleton />
      ) : !hasAnyMeetings ? (
        <EmptyState
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
        />
      ) : (
        /* Grouped Meetings Feed */
        <div className="space-y-2">
          <MeetingGroup title="Today" meetings={grouped.today} />
          <MeetingGroup title="Yesterday" meetings={grouped.yesterday} />
          <MeetingGroup title="Earlier" meetings={grouped.earlier} />
        </div>
      )}
    </AppShell>
  );
}
