import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminBookings } from "@/lib/bookings";
import { BookingStatusBadge } from "@/components/site/booking-status";
import { MetricCard, WorkspaceEmpty, WorkspaceHeading } from "@/components/site/workspace-ui";
import { Icon } from "@/components/site/icon";
import { formatAmount } from "@/lib/vehicle-display";

export default async function AdminPage() {
  const supabase = await createClient();
  const [vehicles, available, customers, pending, active, paid, recent] = await Promise.all([
    supabase.from("vehicles").select("id", { count: "exact", head: true }),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("bookings").select("id", { count: "exact", head: true }).in("status", ["confirmed", "active"]),
    supabase.from("payments").select("amount,status").eq("status", "paid"), getAdminBookings(),
  ]);
  if ([vehicles, available, customers, pending, active, paid].some(result => result.error)) throw new Error("Unable to load workspace statistics.");
  const revenue = (paid.data ?? []).reduce((sum, payment) => sum + Number(payment.amount), 0);
  return <main>
    <WorkspaceHeading eyebrow="Your business, at a glance" title="Overview" description="Keep every journey moving. Your fleet, bookings and payments in one place." action={<Link href="/admin/vehicles/new" className="button-primary"><span aria-hidden="true">＋</span> Add vehicle</Link>} />
    <div className="workspace-metrics">
      <MetricCard label="Fleet vehicles" value={vehicles.count ?? 0} hint={`${available.count ?? 0} available to rent`} href="/admin/vehicles" icon="car" />
      <MetricCard label="Awaiting review" value={pending.count ?? 0} hint="Booking requests" href="/admin/bookings?status=pending" icon="calendar" />
      <MetricCard label="Upcoming & active" value={active.count ?? 0} hint="Confirmed and active rentals" href="/admin/bookings" icon="grid" />
      <MetricCard label="Payments received" value={formatAmount(revenue)} hint="All recorded paid payments" href="/admin/payments" icon="wallet" />
    </div>
    <div className="workspace-dashboard-grid">
      <section className="workspace-panel"><div className="workspace-panel-heading"><div><h2>Recent bookings</h2><p>The latest activity across your rentals</p></div><Link href="/admin/bookings" className="text-link">View all <Icon name="arrow" /></Link></div>
        {recent.length ? <div className="workspace-activity">{recent.slice(0, 6).map(booking => <Link href={`/admin/bookings/${booking.id}`} key={booking.id} className="workspace-activity-row"><span className="workspace-row-icon"><Icon name="car" /></span><div><strong>{booking.vehicle?.name ?? "Vehicle"}</strong><p>{booking.profile?.full_name || "Customer"} · {booking.pickup_date} — {booking.return_date}</p></div><div className="workspace-activity-total"><strong>{formatAmount(booking.total_price)}</strong><BookingStatusBadge status={booking.status} /></div></Link>)}</div> : <WorkspaceEmpty icon="calendar" title="Your next booking starts here" description="New rental requests will appear here, ready for you to review." action={<Link href="/admin/vehicles" className="button-secondary">Manage your fleet</Link>} />}
      </section>
      <div className="workspace-side-panels"><section className="workspace-quick-card"><span className="workspace-quick-icon"><Icon name="check" /></span><p>Ready for the next journey</p><h2>A well-kept fleet.<br />A better rental experience.</h2><span>Add vehicles, keep rates up to date and review new requests.</span><Link href="/admin/vehicles/new">Add a vehicle <Icon name="arrow" /></Link></section>
        <section className="workspace-panel workspace-health"><h2>Workspace summary</h2><Link href="/admin/customers"><span><Icon name="users" /> Customers</span><strong>{customers.count ?? 0}</strong></Link><Link href="/admin/vehicles"><span><Icon name="car" /> Available vehicles</span><strong>{available.count ?? 0}</strong></Link><Link href="/admin/bookings?status=pending"><span><Icon name="calendar" /> Requests to review</span><strong>{pending.count ?? 0}</strong></Link></section>
      </div>
    </div>
  </main>;
}
