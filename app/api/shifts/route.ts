import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts, users } from "@/lib/db/schema";
import { eq, desc, lt, and, isNull, isNotNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const userId = params.get("userId");
  const cursor = params.get("cursor");
  const limit = Math.min(parseInt(params.get("limit") ?? String(PAGE_SIZE), 10), 100);
  const statusFilter = params.get("status");

  const conditions = [];
  if (userId) conditions.push(eq(shifts.userId, userId));
  if (cursor) conditions.push(lt(shifts.startedAt, new Date(parseInt(cursor, 10))));
  if (statusFilter === "active") conditions.push(isNull(shifts.endedAt));
  if (statusFilter === "completed") conditions.push(isNotNull(shifts.endedAt));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const results = db
    .select({
      id: shifts.id,
      userId: shifts.userId,
      userName: users.name,
      startedAt: shifts.startedAt,
      endedAt: shifts.endedAt,
    })
    .from(shifts)
    .innerJoin(users, eq(shifts.userId, users.id))
    .where(where)
    .orderBy(desc(shifts.startedAt))
    .limit(limit + 1)
    .all();

  const hasMore = results.length > limit;
  const page = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? page[page.length - 1].startedAt.getTime().toString() : null;

  return NextResponse.json({
    shifts: page.map((s) => ({
      ...s,
      startedAt: s.startedAt.getTime(),
      endedAt: s.endedAt?.getTime() ?? null,
    })),
    nextCursor,
  });
}
