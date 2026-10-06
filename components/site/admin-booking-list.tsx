"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { BookingView } from "@/lib/bookings";
import { BookingStatusBadge } from "./booking-status";
import { WorkspaceEmpty } from "./workspace-ui";
import { formatAmount } from "@/lib/vehicle-display";

export function AdminBookingList({ bookings, initialStatus = "all" }: { bookings: BookingView[]; initialStatus?: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const filtered = useMemo(() => bookings.filter(booking => (status === "all" || booking.status === status) && `${booking.profile?.full_name ?? ""} ${booking.vehicle?.name ?? ""} ${booking.pickup_location}`.toLowerCase().includes(search.toLowerCase())), [bookings, search, status]);
  return <section className="workspace-panel"><div className="workspace-toolbar"><label>Search bookings<input className="field mt-2" placeholder="Customer, vehicle or collection point" value={search} onChange={event => setSearch(event.target.value)} /></label><label>Status<select className="field mt-2" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option>{["pending", "confirmed", "active", "completed", "cancelled", "rejected"].map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label></div>
    {filtered.length ? <div className="workspace-table-scroll"><table className="workspace-table"><thead><tr><th>Customer & vehicle</th><th>Rental dates</th><th>Collection point</th><th>Total</th><th>Status</th><th><span className="sr-only">View booking</span></th></tr></thead><tbody>{filtered.map(booking => <tr key={booking.id}><td><Link href={`/admin/bookings/${booking.id}`}><strong>{booking.profile?.full_name || "Customer"}</strong></Link><p>{booking.vehicle?.name ?? "Vehicle"}</p></td><td>{booking.pickup_date}<p>to {booking.return_date}</p></td><td>{booking.pickup_location}</td><td><strong>{formatAmount(booking.total_price)}</strong></td><td><BookingStatusBadge status={booking.status} /></td><td><Link href={`/admin/bookings/${booking.id}`} aria-label={`View booking for ${booking.profile?.full_name || "customer"}`}>View →</Link></td></tr>)}</tbody></table></div> : <WorkspaceEmpty icon="calendar" title={bookings.length ? "No matching bookings" : "No booking requests yet"} description={bookings.length ? "Try another search or select a different status." : "Customer requests will appear here with their rental details and status."} />}
    <div className="workspace-table-footer" role="status">Showing {filtered.length} of {bookings.length} bookings</div>
  </section>;
}
