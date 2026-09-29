import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ProfileForm } from "@/components/site/profile-form";
export default async function ProfilePage() { const profile=await requireRole("customer"); return <main className="mx-auto w-full max-w-3xl flex-1 bg-[#faf9f6] px-5 py-12"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">Account settings</p><h1 className="mt-2 text-4xl font-semibold">Your profile</h1><p className="mb-8 mt-2 text-stone-600">Keep your contact details up to date for your bookings.</p><ProfileForm name={profile.full_name} phone={profile.phone} email={profile.email}/><Link href="/my-bookings" className="mt-6 inline-block text-sm font-semibold text-emerald-900">View my bookings →</Link></main>; }
