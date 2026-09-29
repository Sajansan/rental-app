export default function VehiclesLoading() {
  return <main aria-busy="true" className="space-y-5">
    <div className="h-9 w-48 animate-pulse rounded bg-slate-200" />
    <div className="h-12 animate-pulse rounded bg-slate-100" />
    <div className="h-64 animate-pulse rounded border bg-slate-50" />
    <p className="sr-only">Loading vehicle management…</p>
  </main>;
}
