"use client";

import { useState } from "react";
import { Icon } from "./icon";
import { todayInSriLanka, validDate } from "@/lib/dates";

export type SearchValues = { type?: string; pickup?: string; returning?: string; q?: string; transmission?: string; fuel?: string; sort?: string };
export function VehicleSearch({ action = "/vehicles", compact = false, values = {} }: { action?: string; compact?: boolean; values?: SearchValues }) {
  const [pickup, setPickup] = useState(validDate(values.pickup ?? ""));
  const [returning, setReturning] = useState(validDate(values.returning ?? ""));
  const today = todayInSriLanka();
  return <form action={action} className="search-panel">
    <div className="search-basics">
      <label>Vehicle type<select name="type" className="field mt-2" defaultValue={values.type || "all"}><option value="all">All cars & vans</option><option value="car">Cars</option><option value="van">Vans</option></select></label>
      <label>Pickup date<input name="pickup" type="date" value={pickup} onChange={e => { setPickup(e.target.value); if (returning && returning <= e.target.value) setReturning(""); }} required={!!returning} min={today} className="field mt-2" /></label>
      <label>Return date<input name="return" type="date" value={returning} onChange={e => setReturning(e.target.value)} required={!!pickup} min={pickup ? new Date(Date.parse(`${pickup}T00:00:00Z`) + 86400000).toISOString().slice(0,10) : today} className="field mt-2" /></label>
      <button className="button-primary self-end"><Icon name="search" />Find a vehicle</button>
    </div>
    {compact && <details className="advanced-filters" open={!!(values.q || (values.fuel && values.fuel !== "all") || (values.transmission && values.transmission !== "all") || (values.sort && values.sort !== "newest"))}><summary>More filters <span>Name, transmission, fuel & sorting</span></summary><div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4"><label>Search<input name="q" defaultValue={values.q} placeholder="Name, brand or model" className="field mt-2" /></label><label>Transmission<select name="transmission" defaultValue={values.transmission || "all"} className="field mt-2"><option value="all">Any transmission</option><option value="automatic">Automatic</option><option value="manual">Manual</option></select></label><label>Fuel<select name="fuel" defaultValue={values.fuel || "all"} className="field mt-2"><option value="all">Any fuel type</option>{["petrol", "diesel", "hybrid", "electric"].map(fuel => <option key={fuel} value={fuel}>{fuel}</option>)}</select></label><label>Sort by<select name="sort" defaultValue={values.sort || "newest"} className="field mt-2"><option value="newest">Recently added</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="seats">Most seats</option></select></label></div></details>}
  </form>;
}
