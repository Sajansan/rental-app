"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { checkAvailability, rentalDays } from "@/lib/bookings";
import { createClient } from "@/lib/supabase/server";

export type BookingActionState = { error?: string };
export async function createBooking(_state: BookingActionState, form: FormData): Promise<BookingActionState> {
  const profile = await requireRole("customer");
  const vehicleId = String(form.get("vehicle_id") ?? "");
  const pickupDate = String(form.get("pickup_date") ?? "");
  const returnDate = String(form.get("return_date") ?? "");
  const pickupLocation = String(form.get("pickup_location") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();
  const days = rentalDays(pickupDate, returnDate);
  if (!/^[0-9a-f-]{36}$/i.test(vehicleId)) return { error: "Select a valid vehicle." };
  if (!days) return { error: "Choose a valid return date after your pickup date." };
  if (pickupDate < new Date().toISOString().slice(0, 10)) return { error: "Pickup date cannot be in the past." };
  if (pickupLocation.length < 2 || pickupLocation.length > 160) return { error: "Enter a pickup location (2–160 characters)." };
  if (notes.length > 1000) return { error: "Notes must be 1,000 characters or fewer." };
  const supabase = await createClient(true);
  const { data: vehicle, error: vehicleError } = await supabase.from("vehicles").select("id,price_per_day,status").eq("id", vehicleId).maybeSingle();
  if (vehicleError || !vehicle || vehicle.status !== "available") return { error: "This vehicle cannot be booked right now." };
  try {
    if (!(await checkAvailability(vehicleId, pickupDate, returnDate))) return { error: "This vehicle is not available for the selected dates." };
  } catch { return { error: "Unable to check availability. Please try again." }; }
  const { data, error } = await supabase.from("bookings").insert({
    user_id: profile.id, vehicle_id: vehicleId, pickup_date: pickupDate, return_date: returnDate,
    price_per_day: vehicle.price_per_day, total_price: Number(vehicle.price_per_day) * days,
    pickup_location: pickupLocation, notes: notes || null, status: "pending",
  }).select("id").single();
  if (error) {
    console.error("Booking creation failed", { code: error.code });
    return { error: error.code === "23P01" || error.code === "23505" ? "Those dates were just booked. Please choose different dates." : "Unable to submit this booking. Please check your details and try again." };
  }
  revalidatePath("/my-bookings");
  redirect(`/my-bookings/${data.id}?created=1`);
}

export async function updateBookingStatus(bookingId: string, status: string) {
  await requireRole("admin");
  const allowed = ["pending", "confirmed", "active", "completed", "cancelled", "rejected"];
  if (!/^[0-9a-f-]{36}$/i.test(bookingId) || !allowed.includes(status)) return { error: "Invalid booking update." };
  const supabase = await createClient(true);
  const { data: booking, error: readError } = await supabase.from("bookings").select("id,status").eq("id", bookingId).maybeSingle();
  if (readError || !booking) return { error: "Unable to find this booking." };
  const transitions: Record<string, string[]> = { pending: ["confirmed", "rejected", "cancelled"], confirmed: ["active", "cancelled"], active: ["completed"] };
  if (!transitions[booking.status]?.includes(status)) return { error: `A ${booking.status} booking cannot be changed to ${status}.` };
  const { data: updated, error } = await supabase.from("bookings").update({ status: status as "pending" | "confirmed" | "active" | "completed" | "cancelled" | "rejected" }).eq("id", bookingId).eq("status", booking.status).select("id").maybeSingle();
  if (error || !updated) return { error: "This booking changed while you were viewing it. Refresh and try again." };
  revalidatePath("/admin"); revalidatePath("/admin/bookings"); revalidatePath(`/admin/bookings/${bookingId}`); revalidatePath("/my-bookings");
  return { success: true as const };
}
