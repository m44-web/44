import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ShiftHistory } from "@/components/admin/ShiftHistory";

export default async function ShiftsPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.userRole !== "admin") redirect("/employee");
  return <ShiftHistory />;
}
