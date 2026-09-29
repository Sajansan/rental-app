import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle, VehicleImage } from "@/types/profile";

export type VehicleWithImages = Vehicle & { images: VehicleImage[] };
const vehicleFields = "id,name,brand,model,registration_number,vehicle_type,year,seats,transmission,fuel_type,price_per_day,description,status,created_at,updated_at";

export async function getVehicles(): Promise<VehicleWithImages[]> {
  const supabase = await createClient();
  const [{ data, error }, { data: images, error: imageError }] = await Promise.all([
    supabase.from("vehicles").select(vehicleFields).order("created_at", { ascending: false }),
    supabase.from("vehicle_images").select("id,vehicle_id,image_url,is_primary,created_at").order("created_at"),
  ]);
  if (error) throw new Error("Unable to load vehicles.");
  if (imageError) throw new Error("Unable to load vehicle images.");
  const byVehicle = new Map<string, VehicleImage[]>();
  for (const image of images ?? []) byVehicle.set(image.vehicle_id, [...(byVehicle.get(image.vehicle_id) ?? []), image]);
  return (data ?? []).map((vehicle) => ({ ...vehicle, images: byVehicle.get(vehicle.id) ?? [] }));
}

export async function getVehicle(id: string): Promise<VehicleWithImages | null> {
  const supabase = await createClient();
  const [{ data, error }, { data: images, error: imageError }] = await Promise.all([
    supabase.from("vehicles").select(vehicleFields).eq("id", id).maybeSingle(),
    supabase.from("vehicle_images").select("id,vehicle_id,image_url,is_primary,created_at").eq("vehicle_id", id).order("created_at"),
  ]);
  if (error || imageError) throw new Error("Unable to load vehicle details.");
  return data ? { ...data, images: images ?? [] } : null;
}
