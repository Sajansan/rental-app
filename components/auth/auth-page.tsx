import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/auth";
import { AuthForm } from "./auth-form";
import { LogoutButton } from "./logout-button";

export async function AuthPage({ mode }: { mode: "login" | "register" }) {
  const account = await getAccount();
  if (account.status === "authenticated") redirect(`/${account.profile.role}`);
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-5 py-12">
      <section className="w-full rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
      <Link href="/" className="text-sm font-semibold text-emerald-900">← Roadly Rentals</Link>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">{mode === "login" ? "Welcome back" : "Start your journey"}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{mode === "login" ? "Sign in to Roadly" : "Create your account"}</h1>
      <p className="mb-6 mt-2 text-sm text-stone-600">{mode === "login" ? "Access your bookings and account details." : "Register once to request cars and vans for your next trip."}</p>
      {account.status === "error" && <div className="mb-5 space-y-3 rounded-xl bg-red-50 p-4">
        <p role="alert" className="text-sm text-red-800">{account.message}</p>
        <LogoutButton />
      </div>}
      <AuthForm mode={mode} />
      </section>
    </main>
  );
}
