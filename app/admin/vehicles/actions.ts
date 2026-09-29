"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { parseVehicle, publicStoragePath } from "@/lib/vehicle-validation";

function idFrom(form: FormData) {
  const id = form.get("id");
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new Error("Invalid vehicle ID.");
  return id;
}
function friendlyError(error: { code?: string; message?: string }, fallback: string) {
  if (error.code === "23505") return "A vehicle with this registration number already exists.";
  if (error.code === "42501") return "You are not allowed to make this change.";
  return fallback;
}

export async function createVehicle(_previous: { error?: string }, form: FormData): Promise<{ error?: string }> {
  await requireRole("admin");
  let data: { id: string } | null = null;
  try {
    const vehicle = parseVehicle(form);
    const supabase = await createClient(true);
    const result = await supabase.from("vehicles").insert(vehicle).select("id").single();
    if (result.error) return { error: friendlyError(result.error, "Unable to create the vehicle. Please check the details and try again.") };
    data = result.data;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create the vehicle." };
  }
  revalidatePath("/admin/vehicles");
  if (data) redirect(`/admin/vehicles/${data.id}`);
  return { error: "Unable to create the vehicle." };
}

export async function updateVehicle(_previous: { error?: string }, form: FormData): Promise<{ error?: string }> {
  await requireRole("admin");
  let id: string;
  try { id = idFrom(form); } catch (error) { return { error: error instanceof Error ? error.message : "Invalid vehicle ID." }; }
  try {
    const vehicle = parseVehicle(form);
    const supabase = await createClient(true);
    const { error } = await supabase.from("vehicles").update(vehicle).eq("id", id);
    if (error) return { error: friendlyError(error, "Unable to update the vehicle. Please try again.") };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update the vehicle." };
  }
  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${id}`);
  redirect(`/admin/vehicles/${id}`);
}

export async function deleteVehicle(id: string) {
  await requireRole("admin");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return { error: "Invalid vehicle ID." };
  const supabase = await createClient(true);
  const { data: images, error: imageError } = await supabase.from("vehicle_images").select("image_url").eq("vehicle_id", id);
  if (imageError) return { error: "Unable to check the vehicle's image files. The vehicle was not deleted." };
  const paths = (images ?? []).map((image) => publicStoragePath(image.image_url));
  if (paths.some((path) => path === null)) return { error: "An image has an unsupported storage URL. The vehicle was not deleted." };
  if (paths.length) {
    const { error } = await supabase.storage.from("vehicle-images").remove(paths as string[]);
    if (error) return { error: "Unable to remove vehicle image files. The vehicle was not deleted." };
  }
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) return { error: friendlyError(error, "The image files were deleted, but the vehicle record could not be removed. Refresh and try again.") };
  revalidatePath("/admin/vehicles");
  return { success: true as const };
}

export async function registerVehicleImage(vehicleId: string, imageUrl: string) {
  await requireRole("admin");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(vehicleId)) return { error: "Invalid vehicle ID." };
  const objectPath = publicStoragePath(imageUrl);
  if (!objectPath || !objectPath.startsWith(`${vehicleId}/`)) return { error: "Invalid image location." };
  const supabase = await createClient(true);
  const [{ count, error: countError }, { data: vehicle, error: vehicleError }] = await Promise.all([
    supabase.from("vehicle_images").select("id", { count: "exact", head: true }).eq("vehicle_id", vehicleId),
    supabase.from("vehicles").select("id").eq("id", vehicleId).maybeSingle(),
  ]);
  if (countError || vehicleError || !vehicle) return { error: "Unable to find the vehicle. The image was not saved." };
  if ((count ?? 0) >= 5) return { error: "A vehicle can have up to five images." };
  const { error } = await supabase.from("vehicle_images").insert({
    vehicle_id: vehicleId,
    image_url: imageUrl,
    is_primary: count === 0,
  });
  if (error) return { error: "Unable to save the image record. Remove the uploaded file and try again." };
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  revalidatePath("/admin/vehicles");
  return { success: true as const };
}

export async function deleteVehicleImage(vehicleId: string, imageId: string) {
  await requireRole("admin");
  const supabase = await createClient(true);
  const { data: image, error: imageError } = await supabase.from("vehicle_images")
    .select("id,vehicle_id,image_url,is_primary").eq("id", imageId).eq("vehicle_id", vehicleId).maybeSingle();
  if (imageError || !image) return { error: "Unable to find this vehicle image." };
  const path = publicStoragePath(image.image_url);
  if (!path) return { error: "This image has an unsupported storage URL; its file was left untouched." };
  const { error: storageError } = await supabase.storage.from("vehicle-images").remove([path]);
  if (storageError) return { error: "Unable to delete the image file. Its database record was kept." };
  const { error } = await supabase.from("vehicle_images").delete().eq("id", imageId).eq("vehicle_id", vehicleId);
  if (error) return { error: "The file was removed, but its database record could not be deleted. Refresh and contact support if it remains." };
  if (image.is_primary) {
    const { data: nextImage } = await supabase.from("vehicle_images").select("id")
      .eq("vehicle_id", vehicleId).order("created_at").limit(1).maybeSingle();
    if (nextImage) {
      const { error: primaryError } = await supabase.from("vehicle_images").update({ is_primary: true }).eq("id", nextImage.id);
      if (primaryError) {
        revalidatePath(`/admin/vehicles/${vehicleId}`);
        revalidatePath("/admin/vehicles");
        return { success: true as const, warning: "The image was deleted, but another image could not be marked primary. Set one manually." };
      }
    }
  }
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  revalidatePath("/admin/vehicles");
  return { success: true as const };
}

export async function setPrimaryVehicleImage(vehicleId: string, imageId: string) {
  await requireRole("admin");
  const supabase = await createClient(true);
  const { data: selected, error: selectedError } = await supabase.from("vehicle_images").select("id")
    .eq("id", imageId).eq("vehicle_id", vehicleId).maybeSingle();
  if (selectedError || !selected) return { error: "Unable to find this image for the selected vehicle." };
  const { error: clearError } = await supabase.from("vehicle_images").update({ is_primary: false }).eq("vehicle_id", vehicleId);
  if (clearError) return { error: "Unable to update the primary image. Please try again." };
  const { error } = await supabase.from("vehicle_images").update({ is_primary: true }).eq("id", imageId).eq("vehicle_id", vehicleId);
  if (error) {
    // Restore a primary image if the second write fails after clearing the old one.
    const { error: restoreError } = await supabase.from("vehicle_images").update({ is_primary: true }).eq("id", imageId).eq("vehicle_id", vehicleId);
    if (restoreError) return { error: "Unable to confirm the primary image change. Refresh and check the gallery." };
    return { error: "The selected image was set as primary, but the update was not confirmed. Refresh and check the gallery." };
  }
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  revalidatePath("/admin/vehicles");
  return { success: true as const };
}
