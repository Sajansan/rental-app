import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminBookings } from "@/lib/bookings";
import { PaymentForm } from "@/components/site/payment-form";
import { PaymentStatusControl } from "@/components/site/payment-status-control";
import { MetricCard, WorkspaceEmpty, WorkspaceHeading } from "@/components/site/workspace-ui";
import { formatAmount } from "@/lib/vehicle-display";

export default async function PaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  const query = await searchParams;
  const selected = typeof query.booking === "string" ? query.booking : "";
  const supabase = await createClient();
  const [{ data, error }, bookings] = await Promise.all([
    supabase.from("payments").select("id,booking_id,user_id,amount,payment_method,status,paid_at,created_at").order("created_at", { ascending: false }), getAdminBookings(),
  ]);
  if (error) throw new Error("Unable to load payments.");
  const options = bookings.filter(booking => !["cancelled", "rejected"].includes(booking.status)).map(booking => ({ id: booking.id, name: `${booking.profile?.full_name || "Customer"} · ${booking.vehicle?.name ?? "Vehicle"}`, amount: Number(booking.total_price) }));
  const payments = data ?? [];
  const received = payments.filter(payment => payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount), 0);
  const awaiting = payments.filter(payment => payment.status === "pending").reduce((sum, payment) => sum + Number(payment.amount), 0);
  const bookingMap = new Map(bookings.map(booking => [booking.id, booking]));
  return <main>
    <WorkspaceHeading eyebrow="Payments & records" title="Payments" description="Track money received, follow pending payments and keep a clear record of every transaction." />
    <div className="workspace-metrics workspace-metrics-three"><MetricCard label="Payments received" value={formatAmount(received)} hint="Settled cash and bank transfers" icon="wallet" href="/admin/payments" /><MetricCard label="Awaiting payment" value={formatAmount(awaiting)} hint="Recorded pending payments" icon="calendar" href="/admin/payments" /><MetricCard label="Payment records" value={payments.length} hint="All recorded transactions" icon="grid" href="/admin/payments" /></div>
    <details className="workspace-panel workspace-payment-entry" open={!!selected}><summary><span><strong>Record a payment</strong><small>Add a cash payment or bank transfer against a booking.</small></span><span className="workspace-count" aria-hidden="true">＋</span></summary><div className="p-5">{options.length ? <PaymentForm bookings={options} selected={selected} /> : <p className="text-sm text-stone-500">Create a booking before recording a payment.</p>}</div></details>
    <section className="workspace-panel mt-6"><div className="workspace-panel-heading"><div><h2>Transaction history</h2><p>Payments linked to your customer bookings</p></div><span className="workspace-count">{payments.length}</span></div>
      {payments.length ? <div className="workspace-table-scroll"><table className="workspace-table"><thead><tr><th>Customer & booking</th><th>Method</th><th>Status</th><th>Date</th><th>Amount</th></tr></thead><tbody>{payments.map(payment => {
        const booking = bookingMap.get(payment.booking_id);
        return <tr key={payment.id}><td><Link href={`/admin/bookings/${payment.booking_id}`}><strong>{booking?.profile?.full_name || "Customer"}</strong></Link><p>{booking?.vehicle?.name ?? payment.booking_id.slice(0, 8)}</p></td><td className="capitalize">{payment.payment_method?.replace("_", " ") ?? "Not recorded"}</td><td><span className={`rounded-full px-2.5 py-1 text-xs capitalize ${payment.status === "paid" ? "bg-emerald-50 text-emerald-800" : payment.status === "failed" ? "bg-red-50 text-red-800" : "bg-stone-100 text-stone-600"}`}>{payment.status}</span><PaymentStatusControl id={payment.id} status={payment.status} /></td><td>{new Date(payment.paid_at ?? payment.created_at).toLocaleDateString("en-LK", { timeZone: "Asia/Colombo", day: "numeric", month: "short" })}</td><td><strong>{formatAmount(payment.amount)}</strong></td></tr>;
      })}</tbody></table></div> : <WorkspaceEmpty icon="wallet" title="A clear record of every payment" description="Recorded cash payments and bank transfers will appear here, linked to their bookings." />}
    </section>
  </main>;
}
