import Link from "next/link";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { getVehicles } from "@/lib/vehicles";

export default async function VehiclesPage() {
  let vehicles;
  let error = "";
  try { vehicles = await getVehicles(); } catch { error = "Unable to load vehicles. Please refresh and try again."; }
  return <main className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-semibold">Vehicles</h1><p className="mt-1 text-sm text-slate-600">Manage rental vehicles and their images.</p></div><Link href="/admin/vehicles/new" className="button-primary">Add Vehicle</Link></div>
    {error ? <p role="alert" className="rounded bg-red-50 p-4 text-red-800">{error}</p> : <VehicleList vehicles={vehicles ?? []} />}
  </main>;
}
