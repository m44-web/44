import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DailyReport } from "@/components/admin/DailyReport";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.userRole !== "admin") redirect("/employee");

  return <DailyReport />;
}
