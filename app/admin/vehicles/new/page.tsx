import Link from "next/link";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export default function NewVehiclePage() {
  return <main className="space-y-5"><Link href="/admin/vehicles" className="text-sm text-blue-700 underline">← Back to vehicles</Link><h1 className="text-3xl font-semibold">Add Vehicle</h1><VehicleForm /></main>;
}
