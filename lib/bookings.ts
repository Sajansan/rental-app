import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Booking, Payment, Profile, Vehicle, VehicleImage } from "@/types/profile";

export type BookingView = Booking & {
  vehicle: Vehicle | null;
  images: VehicleImage[];
  profile?: Profile | null;
  payments?: Payment[];
};

export function rentalDays(pickupDate: string, returnDate: string) {
  const pickup = new Date(`${pickupDate}T00:00:00Z`);
  const returning = new Date(`${returnDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate) || !/^\d{4}-\d{2}-\d{2}$/.test(returnDate) ||
      Number.isNaN(pickup.valueOf()) || Number.isNaN(returning.valueOf()) || returning <= pickup ||
      pickup.toISOString().slice(0, 10) !== pickupDate || returning.toISOString().slice(0, 10) !== returnDate) return null;
  return Math.round((returning.valueOf() - pickup.valueOf()) / 86_400_000);
}

export async function checkAvailability(vehicleId: string, pickupDate: string, returnDate: string) {
  if (!rentalDays(pickupDate, returnDate)) return false;
  const supabase = await createClient();
  const { data: vehicle, error: vehicleError } = await supabase.from("vehicles").select("status").eq("id", vehicleId).maybeSingle();
  if (vehicleError || !vehicle || vehicle.status !== "available") return false;
  const { data, error } = await supabase.rpc("is_vehicle_available", {
    p_vehicle_id: vehicleId, p_pickup_date: pickupDate, p_return_date: returnDate,
  });
  if (error) throw new Error("Unable to check dates. Please try again.");
  return data;
}

async function enrichBookings(bookings: Booking[], withAdminInfo = false): Promise<BookingView[]> {
  if (!bookings.length) return [];
  const supabase = await createClient();
  const vehicleIds = [...new Set(bookings.map((booking) => booking.vehicle_id))];
  const userIds = [...new Set(bookings.map((booking) => booking.user_id))];
  const bookingIds = bookings.map((booking) => booking.id);
  const [vehiclesResult, imagesResult, profilesResult, paymentsResult] = await Promise.all([
    supabase.from("vehicles").select("id,name,brand,model,registration_number,vehicle_type,year,seats,transmission,fuel_type,price_per_day,description,status,created_at,updated_at").in("id", vehicleIds),
    supabase.from("vehicle_images").select("id,vehicle_id,image_url,is_primary,created_at").in("vehicle_id", vehicleIds).order("created_at"),
    withAdminInfo ? supabase.from("profiles").select("id,full_name,phone,role,avatar_url,created_at,updated_at").in("id", userIds) : Promise.resolve({ data: [], error: null }),
    supabase.from("payments").select("id,booking_id,user_id,amount,payment_method,status,paid_at,created_at").in("booking_id", bookingIds),
  ]);
  if (vehiclesResult.error || imagesResult.error || profilesResult.error || paymentsResult.error) throw new Error("Unable to load booking details.");
  const vehicles = new Map((vehiclesResult.data ?? []).map((vehicle) => [vehicle.id, vehicle]));
  const profiles = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
  const images = imagesResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  return bookings.map((booking) => ({
    ...booking,
    vehicle: vehicles.get(booking.vehicle_id) ?? null,
    images: images.filter((image) => image.vehicle_id === booking.vehicle_id),
    ...(withAdminInfo ? { profile: profiles.get(booking.user_id) ?? null } : {}),
    payments: payments.filter((payment) => payment.booking_id === booking.id),
  }));
}

export async function getCustomerBookings(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load your bookings.");
  return enrichBookings(data ?? []);
}

export async function getCustomerBooking(id: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) throw new Error("Unable to load this booking.");
  if (!data) return null;
  return (await enrichBookings([data]))[0];
}

export async function getAdminBookings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load bookings.");
  return enrichBookings(data ?? [], true);
}

export async function getAdminBooking(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Unable to load booking details.");
  if (!data) return null;
  return (await enrichBookings([data], true))[0];
}

export async function getCustomerProfiles() {
  const supabase = await createClient();
  const [{ data: profiles, error }, { data: bookings, error: bookingError }] = await Promise.all([
    supabase.from("profiles").select("id,full_name,phone,role,avatar_url,created_at").eq("role", "customer").order("created_at", { ascending: false }),
    supabase.from("bookings").select("user_id"),
  ]);
  if (error || bookingError) throw new Error("Unable to load customer records.");
  const counts = new Map<string, number>();
  for (const booking of bookings ?? []) counts.set(booking.user_id, (counts.get(booking.user_id) ?? 0) + 1);
  return (profiles ?? []).map((profile) => ({ ...profile, bookingCount: counts.get(profile.id) ?? 0 }));
}

export async function getCustomerHistory(userId: string) {
  const supabase = await createClient();
  const [{ data: profile, error }, { data: bookings, error: bookingsError }] = await Promise.all([
    supabase.from("profiles").select("id,full_name,phone,role,avatar_url,created_at").eq("id", userId).eq("role", "customer").maybeSingle(),
    supabase.from("bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);
  if (error || bookingsError) throw new Error("Unable to load customer history.");
  return { profile, bookings: await enrichBookings(bookings ?? []) };
}
