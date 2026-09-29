"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = { error?: string; success?: string };
export async function updateProfile(_state: ProfileActionState, form: FormData): Promise<ProfileActionState> {
  const profile = await requireRole("customer");
  const full_name = String(form.get("full_name") ?? "").trim();
  const phoneValue = String(form.get("phone") ?? "").trim();
  if (full_name.length < 2 || full_name.length > 100) return { error: "Name must be between 2 and 100 characters." };
  if (phoneValue.length > 40) return { error: "Phone number must be 40 characters or fewer." };
  const supabase = await createClient(true);
  const { error } = await supabase.from("profiles").update({ full_name, phone: phoneValue || null }).eq("id", profile.id);
  if (error) return { error: "Unable to update your profile. Please try again." };
  revalidatePath("/profile");
  return { success: "Your profile has been updated." };
}
