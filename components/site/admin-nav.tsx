"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const links = [
  { label: "Overview", href: "/admin", icon: "grid" },
  { label: "Bookings", href: "/admin/bookings", icon: "calendar" },
  { label: "Vehicles", href: "/admin/vehicles", icon: "car" },
  { label: "Customers", href: "/admin/customers", icon: "users" },
  { label: "Payments", href: "/admin/payments", icon: "wallet" },
] as const;
export function AdminNav() {
  const pathname = usePathname();
  return <nav aria-label="Admin workspace" className="admin-nav">{links.map(link => <Link key={link.href} href={link.href} aria-current={(link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href)) ? "page" : undefined} className="admin-nav-link"><Icon name={link.icon}/><span>{link.label}</span><span className="admin-active-dot" aria-hidden="true" /></Link>)}</nav>;
}
