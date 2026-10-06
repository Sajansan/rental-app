import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { getVehicle } from "@/lib/vehicles";
import { WorkspaceHeading } from "@/components/site/workspace-ui";

export default async function EditVehiclePage({ params }: PageProps<"/admin/vehicles/[id]/edit">) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) notFound();
  let vehicle;
  try { vehicle = await getVehicle(id); } catch { throw new Error("Unable to load the vehicle for editing. Please refresh and try again."); }
  if (!vehicle) notFound();
  return <main><WorkspaceHeading eyebrow="Fleet management" title={`Edit ${vehicle.name}`} description="Keep this vehicle’s details, rental rate and availability up to date." action={<Link href={`/admin/vehicles/${id}`} className="button-secondary">Back to vehicle</Link>} /><VehicleForm vehicle={vehicle} /></main>;
}
