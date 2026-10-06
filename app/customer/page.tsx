import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getCustomerBookings } from "@/lib/bookings";
import { formatAmount } from "@/lib/vehicle-display";
import { BookingStatusBadge } from "@/components/site/booking-status";
import { Icon } from "@/components/site/icon";

export default async function CustomerPage() {
  const profile = await requireRole("customer");
  let bookings;
  try { bookings = await getCustomerBookings(profile.id); }
  catch { return <main className="page-container flex-1 py-12"><h1 className="text-3xl font-semibold">Your journeys</h1><p role="alert" className="mt-6 rounded-xl bg-red-50 p-5 text-red-800">Unable to load your journeys. Please try again.</p></main>; }
  const upcoming = bookings.filter(b => ["confirmed", "active"].includes(b.status)).sort((a,b) => a.pickup_date.localeCompare(b.pickup_date));
  const pending = bookings.filter(b => b.status === "pending").length;
  const paid = bookings.flatMap(b => b.payments ?? []).filter(p => p.status === "paid").reduce((sum,p) => sum+Number(p.amount),0);
  return <main className="page-container flex-1 py-12">
    <div className="section-heading"><div><p className="eyebrow">YOUR PERSONAL GARAGE</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Hello, {profile.full_name.split(" ")[0] || "traveller"}.</h1><p className="mt-3 text-sm text-stone-500">Your next drive and everything you need to keep it on track.</p></div><Link href="/vehicles" className="button-primary">Plan a journey <Icon name="arrow" /></Link></div>
    <div className="grid gap-4 sm:grid-cols-3">{[["Upcoming journeys", upcoming.length, "calendar"], ["Awaiting confirmation", pending, "car"], ["Payments made", formatAmount(paid), "wallet"]].map(([label,value,icon]) => <Link href="/my-bookings" key={label} className="rounded-2xl border border-stone-200 bg-white p-6"><div className="flex justify-between text-sm text-stone-500"><span>{label}</span><Icon name={icon as "calendar" | "car" | "wallet"}/></div><p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p></Link>)}</div>
    <section className="mt-10"><div className="section-heading"><h2>Next on your calendar</h2><Link href="/my-bookings" className="text-link">All bookings <Icon name="arrow" /></Link></div>{upcoming.length ? <div className="grid gap-4 md:grid-cols-2">{upcoming.slice(0,2).map(b => <Link key={b.id} href={`/my-bookings/${b.id}`} className="rounded-2xl border border-stone-200 bg-white p-6"><div className="flex justify-between gap-3"><h3 className="text-xl font-semibold">{b.vehicle?.name ?? "Your rental"}</h3><BookingStatusBadge status={b.status}/></div><p className="mt-3 text-sm text-stone-500">{b.pickup_date} → {b.return_date}</p><p className="mt-2 text-sm">{b.pickup_location ?? "Collection point to be arranged"}</p></Link>)}</div> : <div className="empty-state"><Icon name="calendar"/><h3>A little adventure looks good on you.</h3><p>{pending ? "Your request is with the team. It will appear here once confirmed." : "Your confirmed journeys will appear here. Start by finding your vehicle."}</p><Link href={pending ? "/my-bookings" : "/vehicles"} className="text-link mt-5">{pending ? "Track your request" : "Explore the fleet"} <Icon name="arrow"/></Link></div>}</section>
  </main>;
}
