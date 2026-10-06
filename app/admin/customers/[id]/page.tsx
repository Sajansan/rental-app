import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerHistory } from "@/lib/bookings";
import { BookingStatusBadge } from "@/components/site/booking-status";
import { WorkspaceEmpty, WorkspaceHeading } from "@/components/site/workspace-ui";
import { formatAmount } from "@/lib/vehicle-display";

export default async function CustomerDetail({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const { profile, bookings } = await getCustomerHistory(id);
  if (!profile) notFound();
  return <main><WorkspaceHeading eyebrow="Customer profile" title={profile.full_name || "Customer"} description="Contact details and the complete rental history for this customer." action={<Link href="/admin/customers" className="button-secondary">All customers</Link>} />
    <dl className="workspace-panel workspace-detail-grid mb-6"><div><dt>Customer name</dt><dd>{profile.full_name || "Customer"}</dd></div><div><dt>Contact number</dt><dd>{profile.phone || "Not provided"}</dd></div><div><dt>Member since</dt><dd>{new Date(profile.created_at).toLocaleDateString("en-LK", { timeZone: "Asia/Colombo", day: "numeric", month: "short", year: "numeric" })}</dd></div></dl>
    <section className="workspace-panel"><div className="workspace-panel-heading"><div><h2>Rental history</h2><p>Every journey requested by this customer</p></div><span className="workspace-count">{bookings.length}</span></div>{bookings.length ? <div className="workspace-table-scroll"><table className="workspace-table"><thead><tr><th>Vehicle</th><th>Rental dates</th><th>Total</th><th>Status</th><th><span className="sr-only">View booking</span></th></tr></thead><tbody>{bookings.map(booking => <tr key={booking.id}><td><strong>{booking.vehicle?.name ?? "Vehicle"}</strong></td><td>{booking.pickup_date}<p>to {booking.return_date}</p></td><td>{formatAmount(booking.total_price)}</td><td><BookingStatusBadge status={booking.status} /></td><td><Link href={`/admin/bookings/${booking.id}`} aria-label={`View ${booking.vehicle?.name ?? "vehicle"} booking`}>View →</Link></td></tr>)}</tbody></table></div> : <WorkspaceEmpty icon="calendar" title="No journeys yet" description="This customer’s rental requests will appear here once they make a booking." />}</section>
  </main>;
}
