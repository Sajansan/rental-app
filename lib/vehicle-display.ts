import type { VehicleImage } from "@/types/profile";
import type { VehicleWithImages } from "./vehicles";

export function primaryImage(vehicle: VehicleWithImages) {
  return vehicle.images.find((image: VehicleImage) => image.is_primary)?.image_url ?? vehicle.images[0]?.image_url ?? null;
}

export function formatPrice(value: number) {
  return `${formatAmount(value)} / day`;
}

export function formatAmount(value: number) {
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(value)}`;
}
