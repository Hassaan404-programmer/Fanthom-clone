'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  searchQuery = '',
  onSearchChange = () => {},
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleRecordClick = () => {
    alert(
      '🎥 Mock Notetaker Ready!\n\nFathom will automatically join your next Google Meet or Zoom call and generate real-time AI notes.'
    );
  };

  const handleSettingsClick = () => {
    alert(
      '⚙️ Settings (Placeholder)\n\nPreferences, integrations, and workspace settings will be available in future releases.'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSearchClick={() => {
            const input = document.querySelector<HTMLInputElement>('input[type="text"]');
            if (input) input.focus();
          }}
          onSettingsClick={handleSettingsClick}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <TopBar
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onRecordClick={handleRecordClick}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
