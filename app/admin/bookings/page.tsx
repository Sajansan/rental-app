import { getAdminBookings } from "@/lib/bookings";
import { WorkspaceHeading } from "@/components/site/workspace-ui";
import { AdminBookingList } from "@/components/site/admin-booking-list";

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const query = await searchParams;
  const status = typeof query.status === "string" && ["pending", "confirmed", "active", "completed", "cancelled", "rejected"].includes(query.status) ? query.status : "all";
  const bookings = await getAdminBookings();
  return <main><WorkspaceHeading eyebrow="Rental operations" title="Bookings" description="Review new requests, follow upcoming journeys and manage every rental." /><AdminBookingList key={status} bookings={bookings} initialStatus={status} /></main>;
}
