import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { getVehicle } from "@/lib/vehicles";

export default async function EditVehiclePage({ params }: PageProps<"/admin/vehicles/[id]/edit">) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) notFound();
  let vehicle;
  try { vehicle = await getVehicle(id); } catch { throw new Error("Unable to load the vehicle for editing. Please refresh and try again."); }
  if (!vehicle) notFound();
  return <main className="space-y-5"><Link href={`/admin/vehicles/${id}`} className="text-sm text-blue-700 underline">← Back to vehicle</Link><h1 className="text-3xl font-semibold">Edit {vehicle.name}</h1><VehicleForm vehicle={vehicle} /></main>;
}
