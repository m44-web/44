import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { EmployeeDetail } from "@/components/admin/EmployeeDetail";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.userRole !== "admin") redirect("/employee");

  const { id } = await params;
  return <EmployeeDetail userId={id} />;
}
