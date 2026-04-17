import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { GeofenceManagement } from "@/components/admin/GeofenceManagement";

export default async function GeofencePage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.userRole !== "admin") redirect("/employee");

  return <GeofenceManagement />;
}
