import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminBookings } from "@/lib/bookings";
import { PaymentForm } from "@/components/site/payment-form";
import { PaymentStatusControl } from "@/components/site/payment-status-control";
import { formatAmount } from "@/lib/vehicle-display";

export default async function PaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  const query = await searchParams;
  const selected = typeof query.booking === "string" ? query.booking : "";
  const supabase = await createClient();
  let result;
  try {
    result = await Promise.all([supabase.from("payments").select("id,booking_id,user_id,amount,payment_method,status,paid_at,created_at").order("created_at", { ascending:false }), getAdminBookings()]);
  } catch { return <main><h1 className="text-3xl font-semibold">Payments</h1><p role="alert" className="mt-5 rounded-xl bg-red-50 p-5 text-red-800">Unable to load payment details. Please try again.</p></main>; }
  const [{ data, error }, bookings] = result;
  if (error) return <main><h1 className="text-3xl font-semibold">Payments</h1><p role="alert" className="mt-5 rounded-xl bg-red-50 p-5 text-red-800">Unable to load payments. Please try again.</p></main>;
  const options = bookings.filter(b => !["cancelled","rejected"].includes(b.status)).map(b => ({ id:b.id, name:`${b.profile?.full_name ?? "Customer"} · ${b.vehicle?.name ?? "Vehicle"}`, amount: Number(b.total_price) }));
  const received = (data ?? []).filter(p => p.status === "paid").reduce((sum,p) => sum+Number(p.amount),0);
  const awaiting = (data ?? []).filter(p => p.status === "pending").reduce((sum,p) => sum+Number(p.amount),0);
  const bookingMap = new Map(bookings.map(b => [b.id,b]));
  return <main><div className="section-heading"><div><p className="eyebrow">PAYMENTS & RECORDS</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Payments</h1><p className="mt-3 text-sm text-stone-500">Record cash and bank transfers, then track each payment.</p></div></div>
    <div className="mb-7 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-stone-200 bg-white p-6"><p className="text-sm text-stone-500">Payments received</p><p className="mt-3 text-3xl font-semibold">{formatAmount(received)}</p></div><div className="rounded-2xl border border-stone-200 bg-white p-6"><p className="text-sm text-stone-500">Pending payments</p><p className="mt-3 text-3xl font-semibold">{formatAmount(awaiting)}</p></div></div>
    <details className="rounded-2xl border border-stone-200 bg-white p-5" open={!!selected}><summary className="text-sm font-semibold">Record a payment</summary><div className="pt-5">{options.length ? <PaymentForm bookings={options} selected={selected}/> : <p className="text-sm text-stone-500">Create a booking before recording a payment.</p>}</div></details>
    <section className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="hidden grid-cols-4 gap-3 bg-stone-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-stone-500 sm:grid"><span>Booking / customer</span><span>Method</span><span>Status</span><span className="text-right">Amount</span></div>{data?.length ? data.map(payment => { const booking = bookingMap.get(payment.booking_id); return <div key={payment.id} className="grid grid-cols-2 gap-4 border-t border-stone-100 px-5 py-5 text-sm sm:grid-cols-4 sm:items-center"><Link href={`/admin/bookings/${payment.booking_id}`} className="font-medium hover:text-emerald-800">{booking?.profile?.full_name ?? "Customer"}<span className="mt-1 block text-xs font-normal text-stone-500">{booking?.vehicle?.name ?? payment.booking_id.slice(0,8)}</span></Link><span className="capitalize text-stone-600">{payment.payment_method?.replace("_"," ") ?? "Not recorded"}</span><div><span className={`rounded-full px-2.5 py-1 text-xs capitalize ${payment.status === "paid" ? "bg-emerald-50 text-emerald-800" : payment.status === "failed" ? "bg-red-50 text-red-800" : "bg-stone-100 text-stone-600"}`}>{payment.status}</span><PaymentStatusControl id={payment.id} status={payment.status}/></div><div className="text-right"><p className="font-semibold">{formatAmount(payment.amount)}</p><p className="mt-1 text-xs text-stone-500">{new Date(payment.paid_at ?? payment.created_at).toLocaleDateString("en-LK", { timeZone:"Asia/Colombo" })}</p></div></div>; }) : <p className="p-10 text-center text-sm text-stone-500">No payments yet. Recorded payments will appear here.</p>}</section>
  </main>;
}
