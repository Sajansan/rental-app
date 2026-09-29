"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteVehicle, deleteVehicleImage, setPrimaryVehicleImage } from "@/app/admin/vehicles/actions";

export function DeleteVehicleButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  function remove() {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    setError("");
    startTransition(async () => {
      const result = await deleteVehicle(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }
  return <span><button type="button" className="text-red-700 underline disabled:opacity-50" disabled={pending} onClick={remove}>{pending ? "Deleting…" : "Delete"}</button>{error && <span className="ml-2 text-red-700" role="alert">{error}</span>}</span>;
}

export function ImageActions({ vehicleId, imageId, isPrimary }: { vehicleId: string; imageId: string; isPrimary: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const perform = (operation: "primary" | "delete") => {
    if (operation === "delete" && !window.confirm("Delete this image and its stored file? This cannot be undone.")) return;
    setError("");
    startTransition(async () => {
      const result = operation === "primary" ? await setPrimaryVehicleImage(vehicleId, imageId) : await deleteVehicleImage(vehicleId, imageId);
      if (result.error) setError(result.error);
      else {
        if ("warning" in result) setError(typeof result.warning === "string" ? result.warning : "");
        router.refresh();
      }
    });
  };
  return <div className="space-y-2">
    {isPrimary ? <span className="text-sm font-medium text-green-800">Primary image</span> : <button disabled={pending} onClick={() => perform("primary")} className="text-sm text-blue-700 underline">{pending ? "Saving…" : "Set as primary"}</button>}
    <button disabled={pending} onClick={() => perform("delete")} className="ml-3 text-sm text-red-700 underline">{pending ? "Working…" : "Delete image"}</button>
    {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
  </div>;
}
