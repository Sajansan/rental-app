import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SessionProfile, Role } from "@/types/profile";

type Account =
  | { status: "anonymous" }
  | { status: "error"; message: string }
  | { status: "authenticated"; profile: SessionProfile };

export const getAccount = cache(async (): Promise<Account> => {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      if (error.name === "AuthSessionMissingError" || error.status === 401 || error.status === 403) {
        return { status: "anonymous" };
      }
      return { status: "error", message: "Unable to verify your session. Please try again." };
    }
    if (!user) return { status: "anonymous" };

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || !["admin", "customer"].includes(profile.role)) {
      return { status: "error", message: "Unable to load your profile. Please try again or contact support." };
    }
    return { status: "authenticated", profile: { ...profile, email: user.email ?? null } };
  } catch {
    return { status: "error", message: "Unable to connect to the authentication service. Please try again." };
  }
});

export async function requireRole(role: Role) {
  const account = await getAccount();
  if (account.status === "anonymous") redirect("/login");
  if (account.status === "error") redirect("/login?error=account");
  if (account.profile.role !== role) redirect(`/${account.profile.role}`);
  return account.profile;
}
