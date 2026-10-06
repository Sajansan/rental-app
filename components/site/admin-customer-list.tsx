"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { WorkspaceEmpty } from "./workspace-ui";

type Customer = { id: string; full_name: string; phone: string | null; bookingCount: number; created_at: string };
export function AdminCustomerList({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => customers.filter(customer => `${customer.full_name} ${customer.phone ?? ""}`.toLowerCase().includes(search.toLowerCase())), [customers, search]);
  return <section className="workspace-panel"><div className="workspace-toolbar"><label>Search customers<input className="field mt-2" placeholder="Name or phone number" value={search} onChange={event => setSearch(event.target.value)} /></label><span className="workspace-count">{customers.length}</span></div>
    {filtered.length ? <div className="workspace-table-scroll"><table className="workspace-table"><thead><tr><th>Customer</th><th>Contact number</th><th>Joined</th><th>Bookings</th><th><span className="sr-only">View customer</span></th></tr></thead><tbody>{filtered.map(customer => <tr key={customer.id}><td><Link href={`/admin/customers/${customer.id}`} className="flex items-center gap-3"><span className="workspace-avatar">{(customer.full_name || "C")[0].toUpperCase()}</span><strong>{customer.full_name || "Customer"}</strong></Link></td><td>{customer.phone || "Not provided"}</td><td>{new Date(customer.created_at).toLocaleDateString("en-LK", { timeZone: "Asia/Colombo", day: "numeric", month: "short", year: "numeric" })}</td><td><span className="workspace-count">{customer.bookingCount}</span></td><td><Link href={`/admin/customers/${customer.id}`} aria-label={`View ${customer.full_name || "customer"} profile`}>View profile →</Link></td></tr>)}</tbody></table></div> : <WorkspaceEmpty icon="users" title={customers.length ? "No matching customers" : "Your customers, all in one place"} description={customers.length ? "Try a different name or phone number." : "Customer accounts and their rental history will appear here."} />}
    <div className="workspace-table-footer" role="status">Showing {filtered.length} of {customers.length} customers</div>
  </section>;
}
