import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminBooking, rentalDays } from "@/lib/bookings";
import { BookingStatusBadge } from "@/components/site/booking-status";
import { BookingStatusControl } from "@/components/site/booking-status-control";
import { WorkspaceHeading } from "@/components/site/workspace-ui";
import { formatAmount, formatPrice } from "@/lib/vehicle-display";

export default async function AdminBookingDetail({ params }: PageProps<"/admin/bookings/[id]">) {
  const { id } = await params;
  const booking = await getAdminBooking(id);
  if (!booking) notFound();
  const days = rentalDays(booking.pickup_date, booking.return_date);
  return <main>
    <WorkspaceHeading eyebrow="Booking details" title={booking.vehicle?.name ?? "Rental request"} description={`${booking.profile?.full_name || "Customer"}${booking.profile?.phone ? ` · ${booking.profile.phone}` : ""}`} action={<BookingStatusBadge status={booking.status} />} />
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="workspace-panel"><div className="workspace-panel-heading"><div><h2>Rental details</h2><p>Dates, collection and pricing for this journey</p></div></div><dl className="workspace-detail-grid workspace-details-two">{[["Pickup date", booking.pickup_date], ["Return date", booking.return_date], ["Duration", `${days ?? "—"} days`], ["Collection point", booking.pickup_location || "Not specified"], ["Daily rate", formatPrice(booking.price_per_day)], ["Booking total", formatAmount(booking.total_price)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{booking.notes && <div className="border-t border-stone-200 p-6"><p className="text-xs text-stone-500">Customer notes</p><p className="mt-3 text-sm leading-7">{booking.notes}</p></div>}</section>
      <div className="space-y-6"><section className="workspace-panel p-6"><h2 className="text-base font-semibold">Manage booking status</h2><p className="mb-5 mt-2 text-xs leading-6 text-stone-500">Review the request and advance it through the rental lifecycle.</p><BookingStatusControl id={booking.id} status={booking.status} />{["completed", "cancelled", "rejected"].includes(booking.status) && <p className="text-sm text-stone-500">This booking is {booking.status}. No further status changes are available.</p>}</section>
      <section className="workspace-panel"><div className="workspace-panel-heading"><div><h2>Payment records</h2><p>Transactions recorded against this booking</p></div></div><div className="p-6">{booking.payments?.length ? <div className="space-y-4">{booking.payments.map(payment => <div key={payment.id} className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4 text-sm last:border-0"><span className="capitalize text-stone-600">{payment.payment_method?.replace("_", " ") ?? "Not recorded"}<small className="mt-1 block text-xs">{payment.status}</small></span><strong className="font-semibold">{formatAmount(payment.amount)}</strong></div>)}</div> : <p className="text-sm text-stone-500">No payments recorded for this booking.</p>}<Link href={`/admin/payments?booking=${booking.id}`} className="button-secondary mt-6">Record a payment →</Link></div></section></div>
    </div>
  </main>;
}
