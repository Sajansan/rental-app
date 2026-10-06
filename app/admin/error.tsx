"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return <main className="empty-state"><h1 className="text-2xl font-semibold">We couldn’t load your workspace</h1><p>Check your connection and try again.</p><button onClick={reset} className="button-primary mt-6">Try again</button></main>;
}
