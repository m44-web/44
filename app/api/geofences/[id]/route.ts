import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { geofences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  db.delete(geofences).where(eq(geofences.id, id)).run();
  return NextResponse.json({ ok: true });
}
