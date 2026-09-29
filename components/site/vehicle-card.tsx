import Image from "next/image";
import Link from "next/link";
import type { VehicleWithImages } from "@/lib/vehicles";
import { formatPrice, primaryImage } from "@/lib/vehicle-display";

export function VehicleCard({ vehicle }: { vehicle: VehicleWithImages }) {
  const image = primaryImage(vehicle);
  return <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><Link href={`/vehicles/${vehicle.id}`} className="block"><div className="relative h-52 bg-stone-100">{image ? <Image src={image} alt={vehicle.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" /> : <div className="grid h-full place-items-center text-sm text-stone-400">No vehicle photo</div>}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">{vehicle.vehicle_type}</p><h3 className="mt-1 text-lg font-semibold text-stone-950">{vehicle.name}</h3><p className="text-sm text-stone-500">{vehicle.brand} {vehicle.model ?? ""}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">Available</span></div><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-stone-100 pt-4 text-xs text-stone-500"><span>{vehicle.seats ?? "—"} seats</span><span>{vehicle.transmission ?? "—"}</span><span>{vehicle.fuel_type ?? "—"}</span></div><div className="mt-5 flex items-baseline justify-between"><p className="font-semibold text-stone-950">{formatPrice(vehicle.price_per_day)}</p><span className="text-sm font-semibold text-emerald-800">View details →</span></div></div></Link></article>;
}

