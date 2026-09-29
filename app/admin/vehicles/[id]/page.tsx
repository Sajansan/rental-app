import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicle } from "@/lib/vehicles";
import { VehicleGallery } from "@/components/vehicles/vehicle-gallery";
import { VehicleImageUploader } from "@/components/vehicles/vehicle-image-uploader";
import { VehicleMetadata } from "@/components/vehicles/vehicle-metadata";
import { DeleteVehicleButton } from "@/components/vehicles/vehicle-mutations";

export default async function VehicleDetailsPage({ params }: PageProps<"/admin/vehicles/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) notFound();
  let vehicle;
  try { vehicle = await getVehicle(id); } catch { throw new Error("Unable to load vehicle details. Please refresh and try again."); }
  if (!vehicle) notFound();
  return <main className="space-y-7">
    <Link href="/admin/vehicles" className="text-sm text-blue-700 underline">← Back to vehicles</Link>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-semibold">{vehicle.name}</h1><p className="text-slate-600">{vehicle.brand} {vehicle.model}</p></div><div className="flex gap-3"><Link className="rounded border px-3 py-2" href={`/admin/vehicles/${id}/edit`}>Edit Vehicle</Link><DeleteVehicleButton id={id} name={vehicle.name} /></div></div>
    <VehicleMetadata vehicle={vehicle} />
    <section className="space-y-4"><h2 className="text-xl font-semibold">Vehicle Images ({vehicle.images.length}/5)</h2><VehicleGallery vehicleId={id} images={vehicle.images} /><VehicleImageUploader vehicleId={id} imageCount={vehicle.images.length} /></section>
  </main>;
}
