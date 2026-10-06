import type { ReactNode } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { AdminNav } from "@/components/site/admin-nav";
import { WorkspaceBreadcrumbs } from "@/components/site/workspace-breadcrumbs";
import { Icon } from "@/components/site/icon";
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("admin");
  const name = profile.full_name || profile.email?.split("@")[0] || "Administrator";
  return <div className="admin-shell">
    <aside className="admin-sidebar"><div className="admin-sidebar-inner">
      <div className="workspace-brand"><span><Icon name="grid" /></span><div><strong>Rental workspace</strong><small>Roadly administration</small></div></div>
      <p className="admin-nav-caption">Manage your business</p><AdminNav />
      <div className="admin-sidebar-bottom"><Link href="/vehicles" className="workspace-site-link"><Icon name="car" /><span>View rental site</span><Icon name="arrow" /></Link><div className="workspace-account"><span className="workspace-avatar">{name[0].toUpperCase()}</span><div><strong>{name}</strong><small>Administrator</small></div><span className="status-dot" /></div></div>
    </div></aside>
    <div className="admin-content"><div className="workspace-topbar"><WorkspaceBreadcrumbs /><span className="workspace-date">{new Date().toLocaleDateString("en-LK", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Colombo" })}</span></div><div className="workspace-view">{children}</div></div>
  </div>;
}
