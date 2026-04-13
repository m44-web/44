import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { getSession, generateId } from "@/lib/auth";
import { emitEvent } from "@/lib/event-bus";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // Check for active shift
  const active = db
    .select()
    .from(shifts)
    .where(and(eq(shifts.userId, session.userId), isNull(shifts.endedAt)))
    .get();

  if (active) {
    return NextResponse.json(
      { error: "既に勤務中です", shift: active },
      { status: 409 }
    );
  }

  const id = generateId();
  const now = new Date();
  db.insert(shifts)
    .values({ id, userId: session.userId, startedAt: now })
    .run();

  emitEvent({
    type: "shift_start",
    userId: session.userId,
    userName: session.userName,
  });

  return NextResponse.json({
    shift: { id, userId: session.userId, startedAt: now.getTime(), endedAt: null },
  });
}
