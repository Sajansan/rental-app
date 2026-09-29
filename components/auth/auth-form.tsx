"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, register } from "@/app/auth/actions";
import type { AuthState } from "@/lib/auth-validation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const [state, action, pending] = useActionState<AuthState, FormData>(isRegister ? register : login, {});
  const inputClass = "field mt-2";
  return (
    <form action={action} className="space-y-5" aria-busy={pending}>
      <fieldset disabled={pending || !!state.success} className="space-y-4 disabled:opacity-70">
        {isRegister && <>
          <label className="block text-sm font-medium" htmlFor="full_name">Full Name
            <input className={inputClass} id="full_name" name="full_name" autoComplete="name" required maxLength={200} />
          </label>
          <label className="block text-sm font-medium" htmlFor="phone">Phone Number <span className="font-normal text-slate-500">(optional)</span>
            <input className={inputClass} id="phone" name="phone" type="tel" autoComplete="tel" maxLength={50} />
          </label>
        </>}
        <label className="block text-sm font-medium" htmlFor="email">Email
          <input className={inputClass} id="email" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="block text-sm font-medium" htmlFor="password">Password
          <input className={inputClass} id="password" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 6 : undefined} required />
        </label>
        {isRegister && <label className="block text-sm font-medium" htmlFor="confirm_password">Confirm Password
          <input className={inputClass} id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={6} required />
        </label>}
        <button className="w-full rounded-xl bg-emerald-900 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait" type="submit" disabled={pending || !!state.success}>
          {pending ? (isRegister ? "Creating account…" : "Signing in…") : (isRegister ? "Create account" : "Login")}
        </button>
      </fieldset>
      {state.error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
      {state.success && <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800">{state.success}</p>}
      <p className="text-center text-sm text-stone-600">
        {isRegister ? "Already have an account? " : "Need an account? "}
        <Link className="font-semibold text-emerald-900 underline" href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
      </p>
    </form>
  );
}
