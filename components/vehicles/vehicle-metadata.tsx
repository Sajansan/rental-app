import type { Vehicle } from "@/types/profile";
import { formatPrice } from "@/lib/vehicle-display";

export function VehicleMetadata({ vehicle }: { vehicle: Vehicle }) {
  const values: [string, string][] = [
    ["Brand", vehicle.brand], ["Model", vehicle.model || "—"], ["Registration", vehicle.registration_number],
    ["Type", vehicle.vehicle_type], ["Year", vehicle.year?.toString() ?? "—"], ["Seats", vehicle.seats?.toString() ?? "—"],
    ["Transmission", vehicle.transmission ?? "—"], ["Fuel", vehicle.fuel_type ?? "—"],
    ["Price per day", formatPrice(vehicle.price_per_day)], ["Status", vehicle.status],
    ["Created", new Date(vehicle.created_at).toLocaleDateString("en-LK")],
  ];
  return <dl className="grid gap-4 sm:grid-cols-2">{values.map(([label, value]) => <div className="rounded border p-3" key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 capitalize">{value}</dd></div>)}
    <div className="rounded border p-3 sm:col-span-2"><dt className="text-xs text-slate-500">Description</dt><dd className="mt-1 whitespace-pre-wrap">{vehicle.description || "—"}</dd></div>
  </dl>;
}
