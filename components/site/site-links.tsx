"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteLinks({ links }: { links: string[][] }) {
  const pathname = usePathname();
  return <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">{links.map(([label, href]) => {
    const active = href === "/" ? pathname === "/" : !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));
    return <Link key={href} className="nav-link" href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
  })}</nav>;
}
