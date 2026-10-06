import Link from "next/link";
import { getAccount } from "@/lib/auth";
import { getVehicles, type VehicleWithImages } from "@/lib/vehicles";
import { checkAvailability, rentalDays } from "@/lib/bookings";
import { VehicleCard } from "@/components/site/vehicle-card";
import { VehicleSearch } from "@/components/site/vehicle-search";
import { Icon } from "@/components/site/icon";
import { todayInSriLanka } from "@/lib/dates";

export default async function VehiclesPage({ searchParams }: PageProps<"/vehicles">) {
  const query = await searchParams;
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  const values = { q: value("q"), type: value("type"), pickup: value("pickup"), returning: value("return"), transmission: value("transmission"), fuel: value("fuel"), sort: value("sort") };
  const account = await getAccount();
  let vehicles: VehicleWithImages[] = [];
  let error = "";
  let dateError = "";
  if (account.status === "authenticated") {
    try {
      vehicles = (await getVehicles()).filter(v => v.status === "available")
        .filter(v => !values.q || `${v.name} ${v.brand} ${v.model ?? ""}`.toLowerCase().includes(values.q.trim().toLowerCase()))
        .filter(v => !values.type || values.type === "all" || v.vehicle_type === values.type)
        .filter(v => !values.transmission || values.transmission === "all" || v.transmission === values.transmission)
        .filter(v => !values.fuel || values.fuel === "all" || v.fuel_type === values.fuel);
      if (values.pickup || values.returning) {
        if (!rentalDays(values.pickup, values.returning) || values.pickup < todayInSriLanka()) { dateError = "Choose a pickup date today or later and a return date after pickup."; vehicles = []; }
        else vehicles = (await Promise.all(vehicles.map(async v => await checkAvailability(v.id, values.pickup, values.returning) ? v : null))).filter((v): v is VehicleWithImages => v !== null);
      }
      if (values.sort === "price-asc") vehicles.sort((a,b) => Number(a.price_per_day)-Number(b.price_per_day));
      if (values.sort === "price-desc") vehicles.sort((a,b) => Number(b.price_per_day)-Number(a.price_per_day));
      if (values.sort === "seats") vehicles.sort((a,b) => (b.seats ?? 0)-(a.seats ?? 0));
    } catch { error = "Unable to load vehicles right now. Please try again in a moment."; }
  }
  const filtered = !!(values.q || (values.type && values.type !== "all") || values.pickup || values.returning || (values.fuel && values.fuel !== "all") || (values.transmission && values.transmission !== "all"));
  return <main className="page-container flex-1 py-12">
    <div className="section-heading"><div><p className="eyebrow">THE ROAD IS YOURS</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Find your next drive.</h1><p className="mt-3 text-sm text-stone-500">Cars and vans, clear daily rates, and room for your plans.</p></div></div>
    <VehicleSearch key={JSON.stringify(values)} compact values={values} />
    {account.status !== "authenticated" ? <div className="empty-state mt-8"><Icon name="car" /><h3>Meet your next travel companion</h3><p>{account.status === "error" ? account.message : "Sign in to view vehicles, compare rates and request your dates."}</p><div className="mt-6 flex justify-center gap-3"><Link href="/login" className="button-primary">Sign in to browse</Link><Link href="/register" className="button-secondary">Create an account</Link></div></div> : <>
      <div className="mb-5 mt-8 flex items-center justify-between"><p className="text-sm text-stone-500">{error || dateError ? "Results unavailable" : `${vehicles.length} ${vehicles.length === 1 ? "vehicle" : "vehicles"}${values.pickup ? " for your dates" : " in the fleet"}`}</p>{filtered && <Link href="/vehicles" className="text-link">Reset filters</Link>}</div>
      {dateError && <p role="alert" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{dateError}</p>}
      {error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">{error}</p> : vehicles.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} pickup={values.pickup} returning={values.returning} />)}</div> : !dateError && <div className="empty-state"><Icon name="car" /><h3>{filtered ? "Let’s try a different route" : "Our fleet is getting ready"}</h3><p>{filtered ? "Try different dates or reset your filters to see more options." : "No available vehicles are listed yet. Check back for updates."}</p>{account.profile.role === "admin" && !filtered && <Link href="/admin/vehicles/new" className="button-primary mt-5">Add a vehicle</Link>}</div>}
    </>}
  </main>;
}
