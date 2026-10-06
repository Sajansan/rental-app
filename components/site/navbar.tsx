import Link from "next/link";
import Image from "next/image";
import { getAccount } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Icon } from "./icon";
import { MobileNav } from "./mobile-nav";
import { SiteLinks } from "./site-links";

export async function Navbar() {
  const account = await getAccount();
  const signedIn = account.status === "authenticated";
  const admin = signedIn && account.profile.role === "admin";
  const links = signedIn ? admin ? [["Home", "/"], ["Find a vehicle", "/vehicles"], ["Workspace", "/admin"]] : [["Find a vehicle", "/vehicles"], ["My journeys", "/customer"], ["My bookings", "/my-bookings"], ["Profile", "/profile"]] : [["Find a vehicle", "/vehicles"], ["How it works", "/#how-it-works"]];
  return <header className="site-navbar"><div className="page-container nav-inner">
    <Link href="/" className="brand" aria-label="Roadly home"><Image src="/logo.svg" alt="" width={35} height={35} className="brand-mark" priority /><span>roadly<small>CAR & VAN RENTALS</small></span></Link>
    <SiteLinks links={links} />
    <div className="flex items-center gap-3"><ThemeToggle />{signedIn ? <div className="hidden md:block"><LogoutButton /></div> : <><Link href="/login" className="nav-link hidden sm:block">Sign in</Link><Link href="/register" className="nav-cta">Get started <Icon name="arrow" /></Link></>}
      <MobileNav links={links} signedIn={signedIn}/>
    </div>
  </div></header>;
}
