"use client";
import { useRef } from "react";
import Link from "next/link";
import { Icon } from "./icon";
import { LogoutButton } from "@/components/auth/logout-button";

export function MobileNav({ links, signedIn }: { links: string[][]; signedIn: boolean }) {
  const menu = useRef<HTMLDetailsElement>(null);
  function close() { if (menu.current) menu.current.open = false; }
  return <details ref={menu} className="mobile-menu md:hidden"><summary aria-label="Open navigation menu"><Icon name="menu" /></summary><nav aria-label="Mobile navigation" onClick={close}>{links.map(([label,href]) => <Link key={href} href={href} className="nav-link">{label}</Link>)}{signedIn ? <LogoutButton /> : <Link href="/login" className="nav-link">Sign in</Link>}</nav></details>;
}
