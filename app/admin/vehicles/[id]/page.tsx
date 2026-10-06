import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicle } from "@/lib/vehicles";
import { VehicleGallery } from "@/components/vehicles/vehicle-gallery";
import { VehicleImageUploader } from "@/components/vehicles/vehicle-image-uploader";
import { VehicleMetadata } from "@/components/vehicles/vehicle-metadata";
import { DeleteVehicleButton } from "@/components/vehicles/vehicle-mutations";
import { WorkspaceHeading } from "@/components/site/workspace-ui";

export default async function VehicleDetailsPage({ params }: PageProps<"/admin/vehicles/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) notFound();
  let vehicle;
  try { vehicle = await getVehicle(id); } catch { throw new Error("Unable to load vehicle details. Please refresh and try again."); }
  if (!vehicle) notFound();
  return <main className="space-y-7">
    <WorkspaceHeading eyebrow="Fleet management" title={vehicle.name} description={`${vehicle.brand} ${vehicle.model ?? ""} · ${vehicle.registration_number}`} action={<div className="flex items-center gap-4"><Link className="button-primary" href={`/admin/vehicles/${id}/edit`}>Edit vehicle</Link><DeleteVehicleButton id={id} name={vehicle.name} /></div>} />
    <VehicleMetadata vehicle={vehicle} />
    <section className="workspace-panel p-6 space-y-5"><div><h2 className="text-lg font-semibold">Vehicle photos <span className="workspace-count ml-2">{vehicle.images.length}/5</span></h2><p className="mt-2 text-xs text-stone-500">Choose a primary photo and manage the images customers see.</p></div><VehicleGallery vehicleId={id} images={vehicle.images} /><VehicleImageUploader vehicleId={id} imageCount={vehicle.images.length} /></section>
  </main>;
}
