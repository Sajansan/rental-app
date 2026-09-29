import Link from "next/link";
import { getVehicles, type VehicleWithImages } from "@/lib/vehicles";
import { checkAvailability, rentalDays } from "@/lib/bookings";
import { VehicleCard } from "@/components/site/vehicle-card";
import { VehicleSearch } from "@/components/site/vehicle-search";

type Query = { [key: string]: string | string[] | undefined };
export default async function VehiclesPage({ searchParams }: PageProps<"/vehicles">) {
  const query = await searchParams as Query;
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  const q = value("q").trim().toLowerCase(); const type = value("type"); const transmission = value("transmission"); const fuel = value("fuel");
  const pickup = value("pickup"); const returning = value("return");
  let vehicles: VehicleWithImages[] = []; let error = ""; let dateError = "";
  try {
    vehicles = (await getVehicles()).filter((v) => v.status === "available")
      .filter((v) => !q || `${v.name} ${v.brand} ${v.model ?? ""}`.toLowerCase().includes(q))
      .filter((v) => !type || type === "all" || v.vehicle_type === type)
      .filter((v) => !transmission || transmission === "all" || v.transmission === transmission)
      .filter((v) => !fuel || fuel === "all" || v.fuel_type === fuel);
    if (pickup || returning) {
      if (!rentalDays(pickup, returning)) dateError = "Choose a valid pickup and return date to filter availability.";
      else vehicles = (await Promise.all(vehicles.map(async (vehicle) => await checkAvailability(vehicle.id, pickup, returning) ? vehicle : null))).filter((v): v is NonNullable<typeof v> => v !== null);
    }
  } catch { error = "Unable to load vehicles right now. Please refresh in a moment."; }
  return <main className="mx-auto w-full max-w-7xl flex-1 bg-[#faf9f6] px-5 py-12"><div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">Our fleet</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Find your vehicle</h1><p className="mt-3 max-w-2xl text-stone-600">Compare cars and vans, then check availability for the dates you need.</p></div><VehicleSearch compact /><form action="/vehicles" className="mt-4 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"><input type="hidden" name="pickup" value={pickup}/><input type="hidden" name="return" value={returning}/><input type="hidden" name="type" value={type||"all"}/><label className="text-xs font-semibold text-stone-600">Transmission<select name="transmission" defaultValue={transmission || "all"} className="field mt-1"><option value="all">All transmissions</option><option value="automatic">Automatic</option><option value="manual">Manual</option></select></label><label className="text-xs font-semibold text-stone-600">Fuel type<select name="fuel" defaultValue={fuel || "all"} className="field mt-1"><option value="all">All fuel types</option>{["petrol","diesel","hybrid","electric"].map((x)=><option key={x} value={x}>{x}</option>)}</select></label><label className="text-xs font-semibold text-stone-600">Search<input name="q" defaultValue={value("q")} placeholder="Name, brand or model" className="field mt-1"/></label><button className="self-end rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold hover:bg-stone-50">Apply filters</button></form><div className="mb-5 mt-8 flex items-center justify-between"><p className="text-sm text-stone-600">{vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"} found</p><Link href="/vehicles" className="text-sm text-emerald-900 underline">Clear filters</Link></div>{dateError && <p role="alert" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{dateError}</p>}{error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">{error}</p> : vehicles.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{vehicles.map((vehicle)=><VehicleCard key={vehicle.id} vehicle={vehicle}/>)}</div> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center"><h2 className="font-semibold">No vehicles match those filters</h2><p className="mt-2 text-sm text-stone-500">Try different dates or remove a filter.</p></div>}</main>;
}



