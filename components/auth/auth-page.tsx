import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/auth";
import { AuthForm } from "./auth-form";
import { LogoutButton } from "./logout-button";

export async function AuthPage({ mode }: { mode: "login" | "register" }) {
  const account = await getAccount();
  if (account.status === "authenticated") redirect(`/${account.profile.role}`);
  return (
    <main className="mx-auto w-full max-w-md px-5 py-12">
      <Link href="/" className="text-sm text-blue-700 underline">Car &amp; Van Rental</Link>
      <h1 className="mb-6 mt-6 text-3xl font-semibold">{mode === "login" ? "Login" : "Create an account"}</h1>
      {account.status === "error" && <div className="mb-5 space-y-3 rounded-md bg-red-50 p-4">
        <p role="alert" className="text-sm text-red-800">{account.message}</p>
        <LogoutButton />
      </div>}
      <AuthForm mode={mode} />
    </main>
  );
}
