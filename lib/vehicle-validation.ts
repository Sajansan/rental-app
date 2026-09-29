import type { Vehicle } from "@/types/profile";

const vehicleTypes = ["car", "van"] as const;
const transmissions = ["automatic", "manual"] as const;
const fuels = ["petrol", "diesel", "hybrid", "electric"] as const;
const statuses = ["available", "maintenance", "inactive"] as const;

function enumValue<T extends readonly string[]>(value: string, values: T, label: string): T[number] | null | undefined {
  if (!value) return null;
  if (values.includes(value)) return value as T[number];
  throw new Error(`Choose a valid ${label}.`);
}
function optionalInteger(raw: FormDataEntryValue | null, label: string, minimum: number, maximum: number) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) throw new Error(`Enter a valid ${label}.`);
  return number;
}

export function parseVehicle(form: FormData): Omit<Vehicle, "id" | "created_at" | "updated_at"> {
  const text = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  const name = text("name");
  const brand = text("brand");
  const registration_number = text("registration_number").toUpperCase();
  if (!name || !brand || !registration_number) throw new Error("Vehicle name, brand and registration number are required.");
  const vehicle_type = enumValue(text("vehicle_type"), vehicleTypes, "vehicle type");
  if (!vehicle_type) throw new Error("Vehicle type is required.");
  const priceRaw = text("price_per_day");
  const price_per_day = Number(priceRaw);
  if (!priceRaw || !Number.isFinite(price_per_day) || price_per_day < 0) throw new Error("Enter a valid price of zero or more.");
  const year = optionalInteger(form.get("year"), "year", 1886, new Date().getFullYear() + 1);
  const seats = optionalInteger(form.get("seats"), "number of seats", 1, 100);
  return {
    name, brand, registration_number, vehicle_type,
    model: text("model") || null,
    year, seats,
    transmission: enumValue(text("transmission"), transmissions, "transmission") ?? null,
    fuel_type: enumValue(text("fuel_type"), fuels, "fuel type") ?? null,
    price_per_day,
    description: text("description") || null,
    status: enumValue(text("status") || "available", statuses, "status") ?? "available",
  };
}

export function publicStoragePath(imageUrl: string) {
  try {
    const path = new URL(imageUrl).pathname.split("/storage/v1/object/public/vehicle-images/")[1];
    return path ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}
