"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = { admin: "Workspace", bookings: "Bookings", vehicles: "Vehicles", customers: "Customers", payments: "Payments", new: "Add vehicle", edit: "Edit vehicle" };
export function WorkspaceBreadcrumbs() {
  const segments = usePathname().split("/").filter(Boolean);
  return <nav aria-label="Breadcrumb" className="workspace-breadcrumbs"><ol>{segments.map((segment, index) => <li key={index}>{index > 0 && <span aria-hidden="true">/</span>}{index === segments.length - 1 ? <span aria-current="page">{labels[segment] ?? "Details"}</span> : <Link href={`/${segments.slice(0, index + 1).join("/")}`}>{labels[segment] ?? "Details"}</Link>}</li>)}</ol></nav>;
}
