import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ShiftController } from "@/components/employee/ShiftController";

export default async function EmployeePage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.userRole === "admin") redirect("/admin");

  return <ShiftController userName={session.userName} />;
}
