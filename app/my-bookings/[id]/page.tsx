import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getCustomerBooking } from "@/lib/bookings";
import { formatAmount } from "@/lib/vehicle-display";
import { PaymentHistory } from "@/components/site/payment-history";
import { BookingStatusBadge } from "@/components/site/booking-status";

export default async function BookingDetailsPage({ params, searchParams }: PageProps<"/my-bookings/[id]">) {
  const account = await requireRole("customer"); const { id } = await params; const query = await searchParams;
  let booking; try { booking = await getCustomerBooking(id, account.id); } catch { return <main className="mx-auto flex-1 max-w-3xl px-5 py-12"><p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">Unable to load this booking.</p></main>; }
  if (!booking) notFound();
  const days = Math.max(1, Math.round((new Date(`${booking.return_date}T00:00:00Z`).valueOf()-new Date(`${booking.pickup_date}T00:00:00Z`).valueOf())/86400000));
  return <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12"><Link href="/my-bookings" className="text-sm text-emerald-900">← My bookings</Link>{query.created === "1" && <div className="mb-6 mt-5 rounded-2xl bg-emerald-50 p-5"><p className="font-semibold text-emerald-950">Booking request submitted.</p><p className="mt-1 text-sm text-emerald-800">The rental team will review and confirm your request.</p></div>}<section className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-stone-500">Booking reference</p><h1 className="mt-2 text-3xl font-semibold">{booking.vehicle?.name ?? "Rental booking"}</h1></div><BookingStatusBadge status={booking.status}/></div><div className="mt-8 grid gap-5 border-y border-stone-100 py-6 sm:grid-cols-2">{[["Pickup",booking.pickup_date],["Return",booking.return_date],["Pickup location",booking.pickup_location],["Duration",`${days} ${days===1?"day":"days"}`]].map(([label,value])=><div key={label}><p className="text-sm text-stone-500">{label}</p><p className="mt-1 font-medium">{value}</p></div>)}</div><div className="space-y-3 py-6 text-sm"><div className="flex justify-between"><span className="text-stone-600">{formatAmount(booking.price_per_day)} × {days} days</span><span>{formatAmount(booking.total_price)}</span></div><div className="flex justify-between border-t border-stone-100 pt-4 text-base font-semibold"><span>Total</span><span>{formatAmount(booking.total_price)}</span></div></div>{booking.notes && <div className="border-t border-stone-100 pt-5"><p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Your notes</p><p className="mt-2 text-sm text-stone-700">{booking.notes}</p></div>}</section><PaymentHistory payments={booking.payments ?? []} total={booking.total_price}/></main>;
}
