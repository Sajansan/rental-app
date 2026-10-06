import Link from "next/link";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { WorkspaceHeading } from "@/components/site/workspace-ui";

export default function NewVehiclePage() {
  return <main><WorkspaceHeading eyebrow="Fleet management" title="Add a vehicle" description="Enter the vehicle details and daily rate. You can add photos once it’s saved." action={<Link href="/admin/vehicles" className="button-secondary">Back to vehicles</Link>} /><VehicleForm /></main>;
}
