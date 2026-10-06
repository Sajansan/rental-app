import Link from "next/link";
import { getAccount } from "@/lib/auth";
import { VehicleSearch } from "@/components/site/vehicle-search";
import { VehicleCard } from "@/components/site/vehicle-card";
import { getVehicles, type VehicleWithImages } from "@/lib/vehicles";
import { Icon } from "@/components/site/icon";

export default async function Home() {
  const account = await getAccount();
  let vehicles: VehicleWithImages[] = [];
  let failed = false;
  if (account.status === "authenticated") {
    try { vehicles = (await getVehicles()).filter(v => v.status === "available").slice(0, 3); }
    catch { failed = true; }
  }
  return <main className="flex-1">
    <section className="home-hero">
      <div className="page-container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><span className="status-dot" /> YOUR NEXT JOURNEY STARTS HERE</span>
          <h1>Good journeys.<br /><span>Great company.</span></h1>
          <p>A city drive or a little escape. Find a car or van that fits your plans, with clear daily rates and a simple booking experience.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/vehicles" className="button-primary">Find your vehicle <Icon name="arrow" /></Link><a href="#how-it-works" className="button-secondary">How it works</a></div>
          <div className="hero-assurance"><Icon name="check" /> Clear daily pricing <span /> <Icon name="check" /> Cars & vans</div>
        </div>
        <div className="journey-art" aria-hidden="true">
          <div className="art-label"><span className="status-dot" /> MADE FOR THE OPEN ROAD</div>
          <svg viewBox="0 0 640 420" fill="none"><defs><linearGradient id="body-paint" x1="160" y1="220" x2="510" y2="320" gradientUnits="userSpaceOnUse"><stop stopColor="#e6eee9"/><stop offset="1" stopColor="#91a89c"/></linearGradient><linearGradient id="glass-paint" x1="225" y1="155" x2="420" y2="235"><stop stopColor="#314842"/><stop offset="1" stopColor="#102522"/></linearGradient></defs><circle cx="350" cy="185" r="145" fill="#d6e4d9"/><path d="M0 314 Q180 245 320 295T640 280V420H0Z" fill="#c3d6c9"/><path d="M0 358 Q220 303 640 333" stroke="#f7f9f5" strokeWidth="3" strokeDasharray="28 20"/><ellipse cx="327" cy="324" rx="239" ry="24" fill="#173d32" opacity=".12"/><path d="M106 256L169 238L229 174Q247 157 272 158L361 159Q389 162 410 185L453 228L523 243Q541 249 544 269L542 305H95L94 283Q96 265 106 256Z" fill="url(#body-paint)" stroke="#698478" strokeWidth="2"/><path d="M189 235L243 180Q251 173 271 174H302V232Z" fill="url(#glass-paint)"/><path d="M314 175H358Q379 179 394 196L426 232H314Z" fill="url(#glass-paint)"/><path d="M306 244V291M442 242L451 290M111 280H529" stroke="#698478" strokeWidth="2"/><rect x="330" y="245" width="28" height="5" rx="2.5" fill="#527163"/><path d="M109 255L144 249L139 269L99 273M502 250L532 258L536 273L504 269" fill="#f0f8ec"/><path d="M101 295H540V311H101Z" fill="#456252"/><circle cx="181" cy="302" r="41" fill="#172622"/><circle cx="181" cy="302" r="24" fill="#aebfb4"/><circle cx="181" cy="302" r="14" fill="#526a5b"/><circle cx="461" cy="302" r="41" fill="#172622"/><circle cx="461" cy="302" r="24" fill="#aebfb4"/><circle cx="461" cy="302" r="14" fill="#526a5b"/><path d="M416 210L438 214L433 231L414 228Z" fill="#729080"/></svg>
          <div className="art-caption"><span>Sri Lanka, at your own pace.</span><Icon name="arrow" /></div>
        </div>
      </div>
      <div className="page-container hero-search"><VehicleSearch /></div>
    </section>
    <section className="page-container py-16" id="fleet">
      <div className="section-heading"><div><p className="eyebrow">A VEHICLE FOR EVERY PLAN</p><h2>Your journey. Your choice.</h2></div><Link href="/vehicles" className="text-link">Explore the fleet <Icon name="arrow" /></Link></div>
      {vehicles.length > 0 ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div> : account.status !== "authenticated" ? <div className="fleet-intro"><div className="grid gap-5 sm:grid-cols-2">{[["car", "Everyday & weekend drives", "Cars for city trips, scenic routes and your next getaway."], ["van", "A little more room", "Vans for group journeys and plans that need extra space."]].map(([icon, title, copy]) => <div key={icon} className="category-card"><span className="icon-tile"><Icon name={icon as "car" | "van"} /></span><h3>{title}</h3><p>{copy}</p></div>)}</div><div className="fleet-signin"><p>Sign in to see our fleet, daily rates and booking options.</p><Link href="/login" className="text-link">Sign in to explore <Icon name="arrow" /></Link></div></div> : <div className="empty-state"><Icon name="car" /><h3>{failed ? "We couldn’t load the fleet" : "The next journey is on its way"}</h3><p>{failed ? "Please try again in a moment." : "There are no available vehicles listed yet. Check back for fleet updates."}</p>{account.profile.role === "admin" && <Link href="/admin/vehicles/new" className="button-primary mt-5">Add your first vehicle</Link>}</div>}
    </section>
    <section className="how-section" id="how-it-works"><div className="page-container py-16"><div className="section-heading"><div><p className="eyebrow">LESS PLANNING. MORE GOING.</p><h2>Three steps to the road.</h2></div><p className="max-w-sm text-sm leading-6 text-stone-500">From your first search to your next drive, we keep things straightforward.</p></div><div className="grid gap-8 md:grid-cols-3">{[["01", "Find your fit", "Choose a car or van and compare the details and daily rate."], ["02", "Make it your journey", "Select your dates, collection point and send a booking request."], ["03", "Get ready to go", "Track your request in your account while our team confirms your booking."]].map(([step, title, copy]) => <div className="step-card" key={step}><span>{step}</span><h3>{title}</h3><p>{copy}</p></div>)}</div></div></section>
  </main>;
}
