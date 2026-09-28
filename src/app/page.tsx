export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-950 text-white">
      <div className="text-center space-y-4 max-w-lg p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Fathom clone
        </h1>
        <p className="text-slate-400 text-sm">
          AI Meeting Notetaker Scaffolded (Step 1 Complete). Seed data and data model ready.
        </p>
      </div>
    </main>
  );
}
