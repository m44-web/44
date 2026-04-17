import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SettingsPanel } from "@/components/SettingsPanel";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <SettingsPanel
      userName={session.userName}
      userEmail={session.userEmail}
      userRole={session.userRole}
    />
  );
}
