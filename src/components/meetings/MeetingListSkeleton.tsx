'use client';

import React from 'react';

export const MeetingListSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Group Skeleton 1 */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-200" />
          <div className="h-5 w-24 bg-slate-200 rounded-md" />
          <div className="h-5 w-8 bg-slate-200 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                  <div className="h-4 w-28 bg-slate-200 rounded-md" />
                </div>
                <div className="h-4 w-4 bg-slate-200 rounded-md" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded-md" />
              <div className="h-4 w-full bg-slate-200 rounded-md" />
              <div className="h-4 w-2/3 bg-slate-200 rounded-md" />
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-1">
                  <div className="w-7 h-7 rounded-full bg-slate-200" />
                  <div className="w-7 h-7 rounded-full bg-slate-200" />
                  <div className="w-7 h-7 rounded-full bg-slate-200" />
                </div>
                <div className="h-4 w-20 bg-slate-200 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
