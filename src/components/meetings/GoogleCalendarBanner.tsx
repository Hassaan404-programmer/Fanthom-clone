'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  RefreshCw,
  Info,
  ChevronRight,
} from 'lucide-react';

export const GoogleCalendarBanner: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncedTime, setSyncedTime] = useState('2m ago');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSyncedTime('Just now');
    }, 600);
  };

  const mockUpcomingMeetings = [
    {
      id: 'up-1',
      title: 'Product Design & AI Specs Sync',
      time: '11:30 AM',
      inMinutes: 'in 25 mins',
      organizer: 'Sarah Jenkins',
      attendees: 4,
      platform: 'Google Meet',
    },
    {
      id: 'up-2',
      title: 'Enterprise Architecture & Cloud Review',
      time: '02:00 PM',
      inMinutes: 'in 3 hours',
      organizer: 'Alex Rivera',
      attendees: 6,
      platform: 'Zoom',
    },
  ];

  return (
    <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-indigo-100/90 shadow-sm relative overflow-hidden">
      {/* Decorative gradient blur circle in background */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none" />

      {/* Top row: Status header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-100/80">
        <div className="flex items-center gap-3">
          {/* Custom Google Calendar styled icon box */}
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-xs text-blue-600">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Google Calendar Connected
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                Active Sync
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-100/70 text-indigo-700 font-medium border border-indigo-200/50">
                Mock State
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>alex.rivera@fathom.ai</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Synced {syncedTime}
              </span>
            </p>
          </div>
        </div>

        {/* Sync refresh CTA */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-slate-500 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      {/* Bottom section: Next upcoming meetings preview */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Upcoming Schedule (Mock Data)
            </span>
          </div>
          <span className="text-xs text-indigo-600 font-medium hover:underline cursor-pointer">
            View full calendar &rarr;
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mockUpcomingMeetings.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                    {item.time}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    {item.inMinutes}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate mt-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Host: {item.organizer} • {item.attendees} attendees ({item.platform})
                </p>
              </div>

              <button
                onClick={() =>
                  alert(
                    `Joining mock call: "${item.title}". Fathom will record and transcribe this session.`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors shrink-0"
              >
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>Join & Record</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
