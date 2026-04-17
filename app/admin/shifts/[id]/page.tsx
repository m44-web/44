import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ShiftDetail } from "@/components/admin/ShiftDetail";

export default async function ShiftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.userRole !== "admin") redirect("/employee");

  const { id } = await params;
  return <ShiftDetail shiftId={id} />;
}
