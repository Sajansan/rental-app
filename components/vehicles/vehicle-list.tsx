"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { VehicleWithImages } from "@/lib/vehicles";
import { formatPrice, primaryImage } from "@/lib/vehicle-display";
import { DeleteVehicleButton } from "./vehicle-mutations";

export function VehicleList({ vehicles }: { vehicles: VehicleWithImages[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => vehicles.filter((vehicle) => {
    const value = `${vehicle.name} ${vehicle.brand} ${vehicle.model ?? ""} ${vehicle.registration_number}`.toLowerCase();
    return value.includes(search.toLowerCase()) && (type === "all" || vehicle.vehicle_type === type) && (status === "all" || vehicle.status === status);
  }), [vehicles, search, type, status]);
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm">Search<input className="field mt-2" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, brand, model, registration" /></label>
      <label className="text-sm">Vehicle Type<select className="field mt-2" value={type} onChange={(event) => setType(event.target.value)}><option value="all">All</option><option value="car">Car</option><option value="van">Van</option></select></label>
      <label className="text-sm">Status<select className="field mt-2" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All</option><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></label>
    </div>
    {filtered.length === 0 ? <p className="empty-state text-stone-500">{vehicles.length ? "No vehicles match these filters." : "No vehicles have been added yet."}</p> :
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50"><tr>{["Vehicle", "Registration", "Type", "Price", "Status", "Actions"].map((heading) => <th className="px-4 py-3 font-semibold" key={heading}>{heading}</th>)}</tr></thead>
        <tbody>{filtered.map((vehicle) => <tr key={vehicle.id} className="border-t">
          <td className="px-4 py-3"><div className="flex items-center gap-3">{primaryImage(vehicle) ? <Image className="h-12 w-16 rounded object-cover" src={primaryImage(vehicle)!} alt={`${vehicle.name} primary image`} width={128} height={96} /> : <div className="flex h-12 w-16 items-center justify-center rounded bg-slate-100 text-xs text-slate-500">No image</div>}<div><Link className="font-medium text-emerald-800" href={`/admin/vehicles/${vehicle.id}`}>{vehicle.name}</Link><p className="text-slate-500">{vehicle.brand} {vehicle.model}</p></div></div></td>
          <td className="px-4 py-3">{vehicle.registration_number}</td><td className="px-4 py-3 capitalize">{vehicle.vehicle_type}</td><td className="px-4 py-3">{formatPrice(vehicle.price_per_day)}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 capitalize">{vehicle.status}</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-3"><Link className="text-emerald-800" href={`/admin/vehicles/${vehicle.id}/edit`}>Edit</Link><DeleteVehicleButton id={vehicle.id} name={vehicle.name} /></div></td>
        </tr>)}</tbody></table></div>}
  </div>;
}
