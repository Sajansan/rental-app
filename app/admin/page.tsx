import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminBookings } from "@/lib/bookings";
import { BookingStatusBadge } from "@/components/site/booking-status";
import { formatAmount } from "@/lib/vehicle-display";

export default async function AdminPage() {
  const supabase=await createClient();
  const [vehicles,available,customers,pending,active,paid,recent] = await Promise.all([
    supabase.from("vehicles").select("id",{count:"exact",head:true}), supabase.from("vehicles").select("id",{count:"exact",head:true}).eq("status","available"),
    supabase.from("profiles").select("id",{count:"exact",head:true}).eq("role","customer"), supabase.from("bookings").select("id",{count:"exact",head:true}).eq("status","pending"),
    supabase.from("bookings").select("id",{count:"exact",head:true}).in("status",["confirmed","active"]), supabase.from("payments").select("amount,status").eq("status","paid"),
    getAdminBookings(),
  ]);
  const revenue=(paid.data??[]).reduce((sum,p)=>sum+Number(p.amount),0);
  const stats=[["Fleet vehicles",vehicles.count??0,"/admin/vehicles"],["Available",available.count??0,"/admin/vehicles"],["Pending requests",pending.count??0,"/admin/bookings"],["Active rentals",active.count??0,"/admin/bookings"],["Customers",customers.count??0,"/admin/customers"],["Payments received",formatAmount(revenue),"/admin/payments"]];
  return <main><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">Operations</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Overview</h1><p className="mt-2 text-stone-600">A live view of your rental business.</p></div><Link href="/admin/vehicles/new" className="rounded-xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white">Add vehicle</Link></div><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map(([label,value,href])=><Link href={String(href)} key={String(label)} className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:shadow-md"><p className="text-sm text-stone-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p></Link>)}</div><section className="mt-10 overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="flex items-center justify-between border-b border-stone-100 px-5 py-4"><div><h2 className="font-semibold">Recent booking requests</h2><p className="mt-1 text-xs text-stone-500">Latest customer activity</p></div><Link href="/admin/bookings" className="text-sm font-semibold text-emerald-900">All bookings →</Link></div>{recent.length ? <div className="divide-y divide-stone-100">{recent.slice(0,6).map((b)=><Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-stone-50"><div><p className="font-medium">{b.vehicle?.name??"Vehicle"} <span className="font-normal text-stone-500">· {b.profile?.full_name??"Customer"}</span></p><p className="mt-1 text-xs text-stone-500">{b.pickup_date} – {b.return_date} · Requested {new Date(b.created_at).toLocaleDateString("en-LK")}</p></div><div className="flex items-center gap-3"><span className="text-sm font-medium">{formatAmount(b.total_price)}</span><BookingStatusBadge status={b.status}/></div></Link>)}</div> : <p className="p-8 text-center text-sm text-stone-500">No bookings have been submitted yet.</p>}</section></main>;
}
