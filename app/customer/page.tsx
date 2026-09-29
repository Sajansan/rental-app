import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
export default async function CustomerPage() { await requireRole("customer"); redirect("/my-bookings"); }
