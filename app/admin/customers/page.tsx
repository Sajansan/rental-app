import { getCustomerProfiles } from "@/lib/bookings";
import { WorkspaceHeading } from "@/components/site/workspace-ui";
import { AdminCustomerList } from "@/components/site/admin-customer-list";

export default async function CustomersPage() {
  const customers = await getCustomerProfiles();
  return <main><WorkspaceHeading eyebrow="People & relationships" title="Customers" description="Know your customers. Find their contact details and explore their rental history." /><AdminCustomerList customers={customers} /></main>;
}
