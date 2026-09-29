import type { BookingStatus } from "@/types/profile";
const styles: Record<BookingStatus, string> = { pending: "bg-amber-50 text-amber-800", confirmed: "bg-blue-50 text-blue-800", active: "bg-emerald-50 text-emerald-800", completed: "bg-stone-100 text-stone-700", cancelled: "bg-stone-100 text-stone-500", rejected: "bg-red-50 text-red-700" };
export function BookingStatusBadge({ status }: { status: BookingStatus }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status]}`}>{status}</span>; }
