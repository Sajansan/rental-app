"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registerVehicleImage } from "@/app/admin/vehicles/actions";

const maxBytes = 5 * 1024 * 1024;
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function VehicleImageUploader({ vehicleId, imageCount }: { vehicleId: string; imageCount: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  function upload() {
    const files = Array.from(inputRef.current?.files ?? []);
    if (!files.length) { setMessage("Choose one or more images first."); return; }
    if (imageCount + files.length > 5) { setMessage("A vehicle can have up to five images."); return; }
    const invalid = files.find((file) => !extensions[file.type] || file.size === 0 || file.size > maxBytes);
    if (invalid) { setMessage(`${invalid.name} must be a JPEG, PNG or WEBP image smaller than 5 MB.`); return; }
    setMessage("");
    startTransition(async () => {
      const supabase = createClient();
      let registeredCount = 0;
      for (const file of files) {
        const path = `${vehicleId}/${crypto.randomUUID()}.${extensions[file.type]}`;
        const { error: uploadError } = await supabase.storage.from("vehicle-images").upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) {
          setMessage(registeredCount ? "Some images uploaded; the remaining upload failed. Refresh to see saved images." : "Unable to upload an image. Check your connection and Storage access, then try again.");
          if (registeredCount) router.refresh();
          return;
        }
        const { data } = supabase.storage.from("vehicle-images").getPublicUrl(path);
        const result = await registerVehicleImage(vehicleId, data.publicUrl);
        if (result.error) {
          await supabase.storage.from("vehicle-images").remove([path]);
          setMessage(registeredCount ? `Some images uploaded. ${result.error}` : result.error);
          if (registeredCount) router.refresh();
          return;
        }
        registeredCount++;
      }
      if (inputRef.current) inputRef.current.value = "";
      setMessage("Image upload complete.");
      router.refresh();
    });
  }
  return <div className="space-y-3 rounded-lg border p-4">
    <label className="block text-sm font-medium">Add vehicle images (JPEG, PNG or WEBP; up to 5 MB each)
      <input ref={inputRef} className="mt-2 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={pending || imageCount >= 5} />
    </label>
    <button type="button" onClick={upload} disabled={pending || imageCount >= 5} className="rounded border px-3 py-2 text-sm disabled:opacity-50">{pending ? "Uploading…" : "Upload selected images"}</button>
    {imageCount >= 5 && <p className="text-sm text-slate-600">This vehicle has reached the five image limit.</p>}
    {message && <p role="status" className="text-sm text-slate-700">{message}</p>}
  </div>;
}
