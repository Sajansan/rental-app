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
  const { data: booking, error: bookingError } = await supabase.from("bookings").select("id,user_id,status").eq("id", bookingId).maybeSingle();
  if (bookingError || !booking) return { error: "Unable to find the selected booking." };
  if (["cancelled", "rejected"].includes(booking.status)) return { error: "Payments cannot be recorded for cancelled or rejected bookings." };
  const { error } = await supabase.from("payments").insert({ booking_id: booking.id, user_id: booking.user_id, amount, payment_method: method as "cash" | "bank_transfer", status: status as "pending" | "paid" | "failed", paid_at: status === "paid" ? new Date().toISOString() : null });
  if (error) return { error: "Unable to record this payment. Check admin payment access and try again." };
  revalidatePayments(bookingId);
  return { success: "Payment recorded." };
}

function revalidatePayments(bookingId: string) {
  for (const path of ["/admin", "/admin/payments", "/admin/bookings", `/admin/bookings/${bookingId}`, "/customer", "/my-bookings", `/my-bookings/${bookingId}`]) revalidatePath(path);
}

export async function updatePaymentStatus(paymentId: string, status: "paid" | "failed") {
  await requireRole("admin");
  if (!/^[0-9a-f-]{36}$/i.test(paymentId) || !["paid", "failed"].includes(status)) return { error: "Invalid payment update." };
  const supabase = await createClient(true);
  const { data: payment, error: readError } = await supabase.from("payments").select("id,status,booking_id").eq("id", paymentId).maybeSingle();
  if (readError || !payment) return { error: "Payment could not be found." };
  if (payment.status === "paid" || payment.status === status) return { error: "This payment is already settled or has changed. Refresh to see its current status." };
  const { data, error } = await supabase.from("payments").update({ status, paid_at: status === "paid" ? new Date().toISOString() : null }).eq("id", paymentId).eq("status", payment.status).select("id").maybeSingle();
  if (error || !data) return { error: "Payment could not be updated. Refresh and try again." };
  revalidatePayments(payment.booking_id);
  return { success: true as const };
}
