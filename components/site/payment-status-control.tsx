"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePaymentStatus } from "@/app/admin/payments/actions";

export function PaymentStatusControl({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  function update(next: "paid" | "failed") {
    startTransition(async () => {
      setMessage("");
      try {
        const result = await updatePaymentStatus(id, next);
        if (result.error) setMessage(result.error);
        else router.refresh();
      } catch { setMessage("Unable to update the payment. Please try again."); }
    });
  }
  if (status === "paid") return null;
  return <div className="mt-2"><div className="flex flex-wrap gap-2"><button disabled={pending} onClick={() => update("paid")} className="text-xs font-semibold text-emerald-800 disabled:opacity-50">{pending ? "Updating…" : "Mark paid"}</button>{status === "pending" && <button disabled={pending} onClick={() => update("failed")} className="text-xs text-stone-500 disabled:opacity-50">Mark failed</button>}</div>{message && <p role="alert" className="mt-2 text-xs text-red-700">{message}</p>}</div>;
}
