import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { AdminNav } from "@/components/site/admin-nav";
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("admin");
  return <div className="admin-shell mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row"><aside className="admin-sidebar p-3 sm:p-4 lg:w-60 lg:shrink-0 lg:p-6"><p className="hidden px-3 pb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 lg:block">Rental workspace</p><AdminNav/><div className="admin-sidebar-note mt-10 hidden rounded-xl p-4 text-xs leading-6 lg:block">A clear view of your fleet, customer journeys and payments.</div></aside><div className="admin-content min-w-0 flex-1 p-5 sm:p-8 lg:p-10">{children}</div></div>;
}
