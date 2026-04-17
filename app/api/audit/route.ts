import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const rows = db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(200)
    .all();

  return NextResponse.json({
    logs: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.getTime(),
    })),
  });
}
