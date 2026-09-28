# Fathom Clone - AI Meeting Notetaker

A full-stack, high-performance web application cloning [Fathom](https://fathom.video/), the AI meeting assistant. Built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Overview & Key Features

This application replicates the core Fathom meeting experience with a clean, light, whitespace-generous user interface:

- **App Shell & Fathom Aesthetics**:
  - Persistent left sidebar navigation (**Meetings**, **Search**, **Settings** placeholder).
  - Responsive top bar with search trigger (`⌘K`), quick action CTAs, and Google Calendar sync pill.
  - Collapsible mobile navigation drawer.

- **Google Calendar Integration (Mocked)**:
  - Header banner displaying active calendar sync state (`alex.rivera@fathom.ai`), live pulse indicator, and mocked upcoming call schedule with **Join & Record** CTAs.

- **Meetings List Feed**:
  - Seed meetings grouped logically by date (**Today**, **Yesterday**, **Earlier**).
  - Category pill filter bar (**Sales**, **1:1**, **Standup**, **Product**, **Engineering**, **Executive**).
  - Cards showing title, date, duration, participant avatar stacks (with initials fallback), and one-line summaries.
  - Skeletons and empty filter states.

- **Timer-Driven Meeting Player**:
  - High-precision timer-driven player with play/pause, skip back (-10s), skip forward (+10s), speed selector (`0.75x`, `1x`, `1.25x`, `1.5x`, `2x`), and animated audio visualizer canvas.
  - Keyboard shortcuts (`Spacebar` to toggle playback, `Left/Right` arrow keys to seek).
  - Interactive scrubber bar with plotted **Chapter Markers** (hover tooltips & click-to-seek).

- **Chapter Timeline Strip**:
  - Horizontal agenda strip displaying clickable chapter badges with timestamps directly above the transcript panel.

- **Synchronized Live Transcript Panel**:
  - Real-time line highlighting and auto-scrolling as playback advances.
  - Manual scroll detection with a floating **"Resume Auto-Scroll"** button.
  - **Speaker Color Coding**: Unique color palettes assigned to each participant.
  - **Speaker Filter Chips**: Filter dialogue by individual speakers (tested on 8-participant, 60-minute calls with 150+ dialogue lines).
  - In-transcript text keyword search.
  - Click any dialogue line to seek player directly to that timestamp.

- **Collapsible Template-Driven AI Summaries**:
  - Collapsible summary panel to prevent dominating screen space on long meetings.
  - Template switcher tabs (**General**, **Sales**, **1:1 Sync**, **Standup**).
  - Interactive **Action Items Checklist** with one-click copy to clipboard.

- **Bookmarked Highlights (LocalStorage Persistence)**:
  - Bookmark current playback moments with custom notes.
  - Saved to `localStorage` keyed by `meetingId`.
  - Listed in chronological order; click any highlight to jump the player to that timestamp.

- **Global Search (`⌘K`)**:
  - Modal command palette searching across all meetings' titles, summaries, and transcripts.
  - Highlights matched snippets with timestamp links.

- **Public Standalone Clip Sharing (`/clip/[id]?start=X&end=Y`)**:
  - Interactive clip generator modal with range sliders and quick duration presets.
  - Public minimal page (`/clip/[id]`) with no sidebar/clutter, bounded playback range, and clip-only transcript dialogue.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19 & TypeScript
- **Styling**: Tailwind CSS v3 & Vanilla CSS Custom Variables
- **Icons**: Lucide React (`lucide-react`)
- **Persistence**: Browser `localStorage` for user-saved highlights

---

## ⚙️ What is Faked / Mocked

1. **Recording Bot & Audio Media**:
   - Uses a high-performance timer simulation (`requestAnimationFrame` / `performance.now()`) with animated CSS waveforms rather than requiring real WebRTC media server connections.
2. **Google Calendar Sync**:
   - Displays a mocked "Active Sync" banner with simulated upcoming call schedule cards.
3. **Settings & Record Actions**:
   - Provide interactive toast & modal previews highlighting future integration steps.

---

## 📦 Data Seeding

All meeting data is pre-seeded from [`src/data/seed-meetings.json`](file:///d:/Hassaan%20Bio/Projects/Fanthom-clone/Fanthom-clone/src/data/seed-meetings.json).

- Includes the 8-participant, 60-minute architecture kickoff meeting (`m-001`) containing 150+ lines of dialogue, 6 chapters, 4 template summaries, and 5 action items.

---

## 💻 How to Run Locally

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation & Execution

```bash
# 1. Clone or navigate to repository root
cd Fanthom-clone

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Production Build

To run a production build and verify type checking:

```bash
npm run build
npm run start
```
