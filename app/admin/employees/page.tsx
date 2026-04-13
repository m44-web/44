import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { EmployeeManagement } from "@/components/admin/EmployeeManagement";

export default async function EmployeesPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.userRole !== "admin") redirect("/employee");

  return <EmployeeManagement />;
}
