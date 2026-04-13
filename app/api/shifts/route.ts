import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const userId = request.nextUrl.searchParams.get("userId");

  const query = db
    .select({
      id: shifts.id,
      userId: shifts.userId,
      userName: users.name,
      startedAt: shifts.startedAt,
      endedAt: shifts.endedAt,
    })
    .from(shifts)
    .innerJoin(users, eq(shifts.userId, users.id))
    .orderBy(desc(shifts.startedAt));

  const results = userId
    ? query.where(eq(shifts.userId, userId)).all()
    : query.all();

  return NextResponse.json({
    shifts: results.map((s) => ({
      ...s,
      startedAt: s.startedAt.getTime(),
      endedAt: s.endedAt?.getTime() ?? null,
    })),
  });
}
