import type { VehicleImage } from "@/types/profile";
import Image from "next/image";
import { ImageActions } from "./vehicle-mutations";

export function VehicleGallery({ vehicleId, images }: { vehicleId: string; images: VehicleImage[] }) {
  if (!images.length) return <p className="rounded border border-dashed p-6 text-sm text-slate-600">No images have been uploaded for this vehicle.</p>;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {images.map((image) => <figure className="space-y-2 rounded-lg border p-3" key={image.id}>
      <Image src={image.image_url} alt="Vehicle" className="h-48 w-full rounded object-cover" width={960} height={540} sizes="(max-width: 768px) 100vw, 33vw" />
      <figcaption><ImageActions vehicleId={vehicleId} imageId={image.id} isPrimary={image.is_primary} /></figcaption>
    </figure>)}
  </div>;
}
