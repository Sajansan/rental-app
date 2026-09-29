import Link from "next/link";
import { getAccount } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/site/theme-toggle";

export async function Navbar() {
  const account = await getAccount();
  return <header className="site-navbar"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5"><Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight"><span className="brand-mark">R</span><span>Roadly</span></Link><nav className="flex items-center gap-2 text-xs font-medium sm:gap-5 sm:text-sm"><Link className="nav-link" href="/vehicles">Vehicles</Link>{account.status === "authenticated" && account.profile.role === "customer" && <><Link className="nav-link hidden sm:block" href="/my-bookings">My bookings</Link><Link className="nav-link hidden sm:block" href="/profile">Profile</Link></>}{account.status === "authenticated" && account.profile.role === "admin" ? <Link className="nav-cta" href="/admin">Admin</Link> : account.status === "authenticated" ? <LogoutButton /> : <><Link className="nav-link hidden sm:block" href="/login">Sign in</Link><Link className="nav-cta" href="/register">Get started</Link></>}<ThemeToggle /></nav></div></header>;
}
