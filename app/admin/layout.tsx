import Link from "next/link";
import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("admin");
  const links=[["Overview","/admin"],["Bookings","/admin/bookings"],["Vehicles","/admin/vehicles"],["Customers","/admin/customers"],["Payments","/admin/payments"]];
  return <div className="admin-shell mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row"><aside className="admin-sidebar p-3 sm:p-4 lg:w-60 lg:shrink-0 lg:p-6"><p className="hidden px-3 pb-3 text-xs font-semibold uppercase tracking-[0.2em] lg:block">Workspace</p><nav className="flex gap-2 overflow-x-auto lg:flex-col">{links.map(([label,href])=><Link key={href} href={href} className="admin-nav-link whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium">{label}</Link>)}</nav><div className="admin-sidebar-note mt-8 hidden rounded-2xl p-4 text-xs leading-5 lg:block">Manage your fleet, customer requests and payment records.</div></aside><div className="admin-content min-w-0 flex-1 p-5 sm:p-8 lg:p-10">{children}</div></div>;
}
