"use client";

import { useActionState } from "react";
import type { Vehicle } from "@/types/profile";
import { createVehicle, updateVehicle } from "@/app/admin/vehicles/actions";

type FormState = { error?: string };
const input = "field mt-2";

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const action = vehicle ? updateVehicle : createVehicle;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  return (
    <form action={formAction} className="workspace-panel space-y-6 p-5 sm:p-8">
      <div className="workspace-form-heading"><h2>Vehicle details</h2><p>Required fields help customers choose the right vehicle.</p></div>
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Vehicle Name<input className={input} name="name" required maxLength={120} defaultValue={vehicle?.name ?? ""} /></label>
        <label className="text-sm font-medium">Brand<input className={input} name="brand" required maxLength={80} defaultValue={vehicle?.brand ?? ""} /></label>
        <label className="text-sm font-medium">Model<input className={input} name="model" maxLength={80} defaultValue={vehicle?.model ?? ""} /></label>
        <label className="text-sm font-medium">Registration Number<input className={input} name="registration_number" required maxLength={40} defaultValue={vehicle?.registration_number ?? ""} /></label>
        <label className="text-sm font-medium">Vehicle Type<select className={input} name="vehicle_type" defaultValue={vehicle?.vehicle_type ?? "car"}><option value="car">Car</option><option value="van">Van</option></select></label>
        <label className="text-sm font-medium">Year<input className={input} name="year" type="number" min="1886" max={new Date().getFullYear() + 1} defaultValue={vehicle?.year ?? ""} /></label>
        <label className="text-sm font-medium">Number of Seats<input className={input} name="seats" type="number" min="1" max="100" defaultValue={vehicle?.seats ?? ""} /></label>
        <label className="text-sm font-medium">Transmission<select className={input} name="transmission" defaultValue={vehicle?.transmission ?? ""}><option value="">Not specified</option><option value="automatic">Automatic</option><option value="manual">Manual</option></select></label>
        <label className="text-sm font-medium">Fuel Type<select className={input} name="fuel_type" defaultValue={vehicle?.fuel_type ?? ""}><option value="">Not specified</option><option value="petrol">Petrol</option><option value="diesel">Diesel</option><option value="hybrid">Hybrid</option><option value="electric">Electric</option></select></label>
        <label className="text-sm font-medium">Price Per Day (LKR)<input className={input} name="price_per_day" type="number" min="0" step="0.01" required defaultValue={vehicle?.price_per_day ?? ""} /></label>
        <label className="text-sm font-medium">Status<select className={input} name="status" defaultValue={vehicle?.status ?? "available"}><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></label>
      </div>
      <label className="block text-sm font-medium">Description<textarea className={input} name="description" rows={4} maxLength={4000} defaultValue={vehicle?.description ?? ""} /></label>
      {state.error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
      <button disabled={pending} className="button-primary disabled:opacity-60">{pending ? "Saving…" : vehicle ? "Save changes" : "Create vehicle"}</button>
    </form>
  );
}
