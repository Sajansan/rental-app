import Link from "next/link";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { getVehicles } from "@/lib/vehicles";
import { WorkspaceHeading } from "@/components/site/workspace-ui";

export default async function VehiclesPage() {
  let vehicles;
  let error = "";
  try { vehicles = await getVehicles(); } catch { error = "Unable to load vehicles. Please refresh and try again."; }
  return <main className="space-y-6">
    <WorkspaceHeading eyebrow="Fleet management" title="Vehicles" description="A clear view of your fleet. Manage availability, daily rates and vehicle details." action={<Link href="/admin/vehicles/new" className="button-primary"><span aria-hidden="true">＋</span> Add vehicle</Link>} />
    {error ? <p role="alert" className="rounded bg-red-50 p-4 text-red-800">{error}</p> : <VehicleList vehicles={vehicles ?? []} />}
  </main>;
}
