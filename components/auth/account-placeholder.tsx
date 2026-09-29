import Link from "next/link";
import { requireRole } from "@/lib/auth";
import type { Role } from "@/types/profile";
import { LogoutButton } from "./logout-button";

export async function AccountPlaceholder({ role }: { role: Role }) {
  const profile = await requireRole(role);
  const label = role === "admin" ? "Admin" : "Customer";
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-5 py-12">
      <Link href="/" className="text-sm text-blue-700 underline">Car &amp; Van Rental</Link>
      <h1 className="text-3xl font-semibold">{label} Dashboard</h1>
      <div className="space-y-2 rounded-lg border border-slate-200 p-6">
        <p className="text-lg">Welcome, {profile.full_name}</p>
        <p className="text-slate-600">Role: {label}</p>
      </div>
      <LogoutButton />
    </main>
  );
}
