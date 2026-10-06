export default function Loading() {
  return <main className="page-container flex-1 py-12" role="status" aria-label="Loading page"><div className="h-8 w-48 animate-pulse rounded-lg bg-stone-200"/><div className="mt-5 h-4 w-72 max-w-full animate-pulse rounded bg-stone-200"/><div className="mt-8 h-48 animate-pulse rounded-2xl border border-stone-200 bg-white"/><p className="sr-only">Loading your next journey…</p></main>;
}
