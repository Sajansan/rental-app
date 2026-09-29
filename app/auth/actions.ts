"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAccount } from "@/lib/auth";
import { validateCredentials, validateRegistration, type AuthState } from "@/lib/auth-validation";

function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

async function finishLogin(): Promise<AuthState> {
  const account = await getAccount();
  if (account.status === "error") return { error: account.message };
  if (account.status === "anonymous") return { error: "Unable to verify your session. Please sign in again." };
  revalidatePath("/", "layout");
  redirect(`/${account.profile.role}`);
}

export async function login(_previous: AuthState, form: FormData): Promise<AuthState> {
  const email = field(form, "email").trim();
  const password = field(form, "password");
  const validation = validateCredentials(email, password);
  if (validation) return { error: validation };
  try {
    const supabase = await createClient(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.code === "invalid_credentials") return { error: "Invalid email or password." };
      if (error.code === "email_not_confirmed") return { error: "Please verify your email before signing in." };
      return { error: "Unable to sign in. Please try again shortly." };
    }
  } catch {
    return { error: "Unable to connect. Please try again." };
  }
  return finishLogin();
}

export async function register(_previous: AuthState, form: FormData): Promise<AuthState> {
  const full_name = field(form, "full_name").trim();
  const phone = field(form, "phone").trim();
  const email = field(form, "email").trim();
  const password = field(form, "password");
  const validation = validateRegistration(full_name, email, password, field(form, "confirm_password"));
  if (validation) return { error: validation };
  try {
    const supabase = await createClient(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // The existing database trigger assigns customer; no role comes from the form.
      options: { data: { full_name, phone: phone || null } },
    });
    if (error) {
      if (error.code === "user_already_exists") return { error: "Unable to create account. Try signing in instead." };
      if (error.code === "weak_password") return { error: "Please choose a stronger password." };
      return { error: "Unable to create account. Please try again shortly." };
    }
    if (!data.session) return { success: "Check your email to verify your account, then sign in. If you already have an account, sign in instead." };
  } catch {
    return { error: "Unable to connect. Please try again." };
  }
  return finishLogin();
}

export async function logout(): Promise<AuthState> {
  try {
    const supabase = await createClient(true);
    const { error } = await supabase.auth.signOut();
    if (error) return { error: "Unable to log out. Please try again." };
  } catch {
    return { error: "Unable to connect. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
