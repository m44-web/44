import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { desc, eq, and, lt } from "drizzle-orm";
import { getSession } from "@/lib/auth";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const cursor = params.get("cursor");
  const limit = Math.min(parseInt(params.get("limit") ?? String(PAGE_SIZE), 10), 200);
  const actionFilter = params.get("action");

  const conditions = [];
  if (cursor) conditions.push(lt(auditLogs.id, parseInt(cursor, 10)));
  if (actionFilter) conditions.push(eq(auditLogs.action, actionFilter));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = db
    .select()
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.id))
    .limit(limit + 1)
    .all();

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? page[page.length - 1].id.toString() : null;

  return NextResponse.json({
    logs: page.map((r) => ({
      ...r,
      createdAt: r.createdAt.getTime(),
    })),
    nextCursor,
  });
}
