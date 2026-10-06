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
  return <dl className="workspace-panel workspace-detail-grid">{values.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className="capitalize">{value}</dd></div>)}
    <div className="sm:col-span-2 lg:col-span-3"><dt>Description</dt><dd className="whitespace-pre-wrap">{vehicle.description || "No description provided."}</dd></div>
  </dl>;
}
