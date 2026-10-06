export default function AdminLoading() {
  return <div className="workspace-loading" role="status" aria-label="Loading workspace"><div className="workspace-skeleton workspace-skeleton-title" /><div className="workspace-metrics">{[0, 1, 2, 3].map(index => <div key={index} className="workspace-skeleton workspace-skeleton-card" />)}</div><div className="workspace-skeleton workspace-skeleton-panel" /><span className="sr-only">Loading workspace…</span></div>;
}
