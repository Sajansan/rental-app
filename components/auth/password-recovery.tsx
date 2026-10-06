"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createClient as createAuthClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "./password-field";

const invalidLink = "This recovery link is invalid or has expired. Request a new link below.";

export function PasswordRecovery({ mode }: { mode: "request" | "reset" }) {
  const [ready, setReady] = useState(mode === "request");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const verification = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (mode !== "reset") return;
    async function verifyRecovery() {
        // Recovery emails use fragments; older SDK links may arrive via PKCE.
        // Remove fragment credentials before creating a client or following links.
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = fragment.get("access_token");
        const refreshToken = fragment.get("refresh_token");
        const query = new URLSearchParams(window.location.search);
        const tokenHash = query.get("token_hash");
        const tokenType = query.get("type");
        if (tokenHash) {
          query.delete("token_hash");
          query.delete("type");
          window.history.replaceState(null, "", window.location.pathname + (query.size ? `?${query}` : "") + window.location.hash);
        }
        if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
        const supabase = createClient();
        if (query.has("error") || fragment.has("error") || fragment.has("error_code")) throw new Error(invalidLink);
        if (tokenHash) {
          if (tokenType !== "recovery") throw new Error(invalidLink);
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
          if (error) throw new Error(invalidLink);
        }
        if (accessToken || refreshToken) {
          if (!accessToken || !refreshToken || fragment.get("type") !== "recovery") throw new Error(invalidLink);
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw new Error(invalidLink);
        }
        // getUser validates the session with Auth before showing the password form.
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) throw new Error(invalidLink);
    }
    let active = true;
    // Consume a single-use recovery link once, including in React Strict Mode.
    verification.current ??= verifyRecovery();
    void verification.current.then(() => { if (active) setReady(true); }).catch(() => { if (active) setError(invalidLink); });
    return () => { active = false; };
  }, [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setError("");
    setPending(true);
    try {
      const supabase = createClient();
      if (mode === "request") {
        // Recovery emails can be opened in another browser without a PKCE cookie.
        const { url, key } = getSupabaseConfig();
        const recovery = createAuthClient(url, key, { auth: { storageKey: "roadly-recovery-request", flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
        const { error } = await recovery.auth.resetPasswordForEmail(String(values.get("email") ?? "").trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          setError(error.status === 429 ? "Too many requests. Wait a few minutes and try again." : "Unable to send a recovery email. Please try again later.");
          return;
        }
        setSuccess("If an account exists for this email, you’ll receive a password recovery link. Check your inbox and spam folder, and use the newest email.");
      } else {
        const password = String(values.get("password") ?? "");
        if (password.length < 12) { setError("Use at least 12 characters for your new password."); return; }
        if (password !== values.get("confirmation")) { setError("Passwords do not match."); return; }
        const { data, error: sessionError } = await supabase.auth.getUser();
        if (sessionError || !data.user) { setReady(false); setError(invalidLink); return; }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setError(error.code === "weak_password" ? "Choose a stronger password." : error.code === "same_password" ? "Choose a password different from your current password." : "Unable to update your password. Try a fresh recovery link.");
          return;
        }
        form.reset();
        const { error: signOutError } = await supabase.auth.signOut();
        setSuccess(signOutError ? "Your password has been changed. Please sign out and sign in again with your new password." : "Your password has been changed. Sign in with your new password.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-5 py-12">
      <section className="w-full rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/login" className="text-sm font-semibold text-emerald-900">← Back to sign in</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">Account recovery</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{mode === "request" ? "Forgot your password?" : "Set a new password"}</h1>
        <p className="mb-6 mt-2 text-sm text-stone-600">{mode === "request" ? "We’ll email you a secure link to reset your password." : "Choose a strong password you haven’t used before."}</p>
        {mode === "reset" && !ready && !error && <p role="status" className="text-sm text-stone-600">Checking your recovery link…</p>}
        {ready && !success && <form onSubmit={submit} className="space-y-5" aria-busy={pending}>
          <fieldset disabled={pending} className="space-y-4 disabled:opacity-70">
            {mode === "request" ? <label className="block text-sm font-medium" htmlFor="recovery-email">Email
              <input id="recovery-email" name="email" type="email" autoComplete="email" required className="field mt-2" />
            </label> : <>
              <PasswordField label="New password" id="new-password" name="password" autoComplete="new-password" required minLength={12} aria-describedby="password-hint" />
              <p id="password-hint" className="text-xs text-stone-600">Use at least 12 characters. A unique passphrase works well.</p>
              <PasswordField label="Confirm new password" id="confirm-password" name="confirmation" autoComplete="new-password" required minLength={12} />
            </>}
            <button type="submit" disabled={pending} className="w-full rounded-xl bg-emerald-900 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait">{pending ? "Please wait…" : mode === "request" ? "Send recovery link" : "Update password"}</button>
          </fieldset>
        </form>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {success && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{success}</p>}
        {mode === "reset" && <Link href={success ? "/login" : "/forgot-password"} className="mt-5 inline-block text-sm font-semibold text-emerald-900 underline">{success ? "Sign in" : "Request a new recovery link"}</Link>}
      </section>
    </main>
  );
}
