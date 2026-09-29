"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type PaymentActionState = { error?: string; success?: string };
export async function recordPayment(_state: PaymentActionState, form: FormData): Promise<PaymentActionState> {
  await requireRole("admin");
  const bookingId = String(form.get("booking_id") ?? "");
  const amount = Number(form.get("amount"));
  const method = String(form.get("payment_method") ?? "");
  const status = String(form.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(bookingId) || !Number.isFinite(amount) || amount <= 0 || !["cash", "bank_transfer"].includes(method) || !["pending", "paid", "failed"].includes(status)) return { error: "Enter valid payment details." };
  const supabase = await createClient(true);
  const { data: booking, error: bookingError } = await supabase.from("bookings").select("id,user_id").eq("id", bookingId).maybeSingle();
  if (bookingError || !booking) return { error: "Unable to find the selected booking." };
  const { error } = await supabase.from("payments").insert({ booking_id: booking.id, user_id: booking.user_id, amount, payment_method: method as "cash" | "bank_transfer", status: status as "pending" | "paid" | "failed", paid_at: status === "paid" ? new Date().toISOString() : null });
  if (error) return { error: "Unable to record this payment. Check admin payment access and try again." };
  revalidatePath("/admin/payments"); revalidatePath("/admin/bookings");
  return { success: "Payment recorded." };
}
