import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuditLog } from "@/components/admin/AuditLog";

export default async function AuditPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.userRole !== "admin") redirect("/employee");

  return <AuditLog />;
}
