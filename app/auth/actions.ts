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

function loginErrorMessage(error: { code?: string; status?: number; name?: string }) {
  if (error.code === "invalid_credentials") return "Invalid email or password.";
  if (error.code === "email_not_confirmed") return "Supabase is still requiring email confirmation. Turn off Confirm email in Authentication → Providers → Email to allow direct sign-in.";
  if (error.code === "user_banned") return "This account is disabled. Please contact support.";
  if (error.code === "email_address_not_authorized") return "This email address is not allowed to sign in to this Supabase project.";
  if (error.code === "over_request_rate_limit" || error.status === 429) return "Too many sign-in attempts. Wait a few minutes and try again.";
  if (error.code === "request_timeout" || error.name === "AuthRetryableFetchError" || (error.status !== undefined && error.status >= 500)) {
    return "Supabase Auth is temporarily unavailable. Check your connection and try again.";
  }
  return "Supabase could not complete sign-in. Check the server terminal for the auth error code and status.";
}

function registrationErrorMessage(error: { code?: string; status?: number; name?: string }) {
  if (error.code === "user_already_exists" || error.code === "email_exists") return "An account with this email already exists. Try signing in instead.";
  if (error.code === "weak_password") return "Please choose a stronger password.";
  if (error.code === "signup_disabled") return "New account registration is disabled in Supabase Auth.";
  if (error.code === "email_provider_disabled") return "Email and password sign-up is disabled in Supabase Auth.";
  if (error.code === "email_address_not_authorized") return "This email address is not allowed by the Supabase project's email provider settings.";
  if (error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit" || error.status === 429) {
    return "Too many sign-up attempts. Wait a few minutes and try again.";
  }
  if (error.code === "captcha_failed") return "The sign-up verification failed. Refresh the page and try again.";
  if (error.code === "unexpected_failure" || (error.status !== undefined && error.status >= 500)) {
    return "Supabase Auth could not create the account. Check the Supabase Auth logs and the existing profile-creation trigger.";
  }
  return "Supabase could not complete registration. Check the server terminal for the auth error code and status.";
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
      // Codes/status only: never write the submitted email/password or access tokens to logs.
      console.error("Supabase sign-in failed", { code: error.code, status: error.status, name: error.name });
      return { error: loginErrorMessage(error) };
    }
  } catch {
    console.error("Supabase sign-in request failed before an auth response was received.");
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
      // Auth errors may include account-creation trigger or provider configuration failures.
      // Log only diagnostic metadata, never user data or credentials.
      console.error("Supabase sign-up failed", { code: error.code, status: error.status, name: error.name });
      return { error: registrationErrorMessage(error) };
    }
    if (!data.session) return { error: "Supabase created the account but did not start a login session. Turn off Confirm email in Authentication → Providers → Email to register and sign in directly." };
  } catch {
    console.error("Supabase sign-up request failed before an auth response was received.");
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
