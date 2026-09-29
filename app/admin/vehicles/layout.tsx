import Link from "next/link";
import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";

export default async function VehiclesLayout({ children }: { children: ReactNode }) {
  await requireRole("admin");
  return <section className="mx-auto w-full max-w-6xl space-y-6 px-5 py-10">
    <nav className="flex items-center justify-between border-b pb-4"><Link className="font-semibold" href="/admin">Admin Dashboard</Link><Link className="text-sm text-blue-700 underline" href="/admin/vehicles">Vehicle Management</Link></nav>
    {children}
  </section>;
}
