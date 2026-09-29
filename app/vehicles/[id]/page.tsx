import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicle } from "@/lib/vehicles";
import { getAccount } from "@/lib/auth";
import { BookingForm } from "@/components/site/booking-form";
import { formatPrice, primaryImage } from "@/lib/vehicle-display";

export default async function VehicleDetailsPage({ params, searchParams }: PageProps<"/vehicles/[id]">) {
  const { id } = await params; const query = await searchParams;
  let vehicle; try { vehicle = await getVehicle(id); } catch { return <main className="mx-auto flex-1 max-w-4xl px-5 py-20"><p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">Unable to load this vehicle. Please try again.</p></main>; }
  if (!vehicle) notFound();
  const account = await getAccount(); const image = primaryImage(vehicle);
  const canBook = vehicle.status === "available" && !(account.status === "authenticated" && account.profile.role === "admin");
  const pickup = typeof query.pickup === "string" ? query.pickup : ""; const returning = typeof query.return === "string" ? query.return : "";
  return <main className="mx-auto w-full max-w-7xl flex-1 bg-[#faf9f6] px-5 py-10"><Link href="/vehicles" className="text-sm font-medium text-emerald-900">← All vehicles</Link><div className="mt-5 grid gap-8 lg:grid-cols-[1.25fr_.75fr]"><section><div className="relative h-[300px] overflow-hidden rounded-3xl bg-stone-200 sm:h-[480px]">{image ? <Image src={image} alt={vehicle.name} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover"/> : <div className="grid h-full place-items-center text-stone-500">No vehicle photo available</div>}</div>{vehicle.images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-3">{vehicle.images.filter((x)=>x.image_url!==image).slice(0,4).map((photo)=><div key={photo.id} className="relative h-24 overflow-hidden rounded-xl bg-stone-200"><Image src={photo.image_url} alt={`${vehicle.name} view`} fill sizes="25vw" className="object-cover"/></div>)}</div>}<div className="mt-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">{vehicle.vehicle_type} · {vehicle.year ?? "Year not listed"}</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{vehicle.name}</h1><p className="mt-2 text-stone-600">{vehicle.brand} {vehicle.model ?? ""}</p><p className="mt-6 whitespace-pre-line leading-7 text-stone-600">{vehicle.description || "A well-maintained vehicle, ready for your next journey."}</p></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Seats", vehicle.seats ?? "—"],["Transmission", vehicle.transmission ?? "—"],["Fuel", vehicle.fuel_type ?? "—"],["Availability", vehicle.status]].map(([k,v])=><div key={k} className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs text-stone-500">{k}</p><p className="mt-1 font-semibold capitalize">{v}</p></div>)}</div></section><aside className="h-fit rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-6"><p className="text-sm text-stone-500">Rental rate</p><p className="mt-1 text-3xl font-semibold">{formatPrice(vehicle.price_per_day)}</p><div className="my-6 border-t border-stone-100"/>{canBook ? <BookingForm vehicleId={vehicle.id} price={vehicle.price_per_day} signedIn={account.status === "authenticated" && account.profile.role === "customer"} start={pickup} end={returning}/> : <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600">This vehicle is currently {vehicle.status} and cannot be booked online.</p>}</aside></div></main>;
}


