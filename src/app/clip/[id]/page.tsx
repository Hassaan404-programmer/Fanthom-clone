import React from 'react';
import { getMeetingById } from '@/lib/data';
import { ClipPlayerClient } from '@/components/clip/ClipPlayerClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ClipPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClipPage({ params }: ClipPageProps) {
  const { id } = await params;
  const meeting = getMeetingById(id);

  if (!meeting) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-lg space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Clip Not Found</h2>
          <p className="text-sm text-slate-500">
            The requested meeting clip ID &quot;<span className="font-mono text-slate-700">{id}</span>&quot; could not be found.
          </p>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ClipPlayerClient meeting={meeting} />;
}
