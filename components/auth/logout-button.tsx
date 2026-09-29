"use client";

import { useActionState } from "react";
import { logout } from "@/app/auth/actions";

export function LogoutButton() {
  const [state, action, pending] = useActionState(logout, {});
  return (
    <form action={action} className="space-y-2">
      <button type="submit" disabled={pending} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50">
        {pending ? "Logging out…" : "Logout"}
      </button>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
