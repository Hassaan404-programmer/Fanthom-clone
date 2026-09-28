'use client';

import React from 'react';
import { Meeting } from '@/types';
import { MeetingCard } from './MeetingCard';
import { Calendar, History, Sun } from 'lucide-react';

interface MeetingGroupProps {
  title: string;
  meetings: Meeting[];
}

export const MeetingGroup: React.FC<MeetingGroupProps> = ({
  title,
  meetings,
}) => {
  if (!meetings || meetings.length === 0) return null;

  const getGroupIcon = (t: string) => {
    switch (t.toLowerCase()) {
      case 'today':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'yesterday':
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <section className="space-y-4 mb-8">
      {/* Group Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            {getGroupIcon(title)}
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60 font-mono">
            {meetings.length}
          </span>
        </div>
      </div>

      {/* Group Meetings Grid */}
      <div className="grid grid-cols-1 gap-4">
        {meetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </div>
    </section>
  );
};
