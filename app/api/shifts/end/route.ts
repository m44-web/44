import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { emitEvent } from "@/lib/event-bus";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const active = db
    .select()
    .from(shifts)
    .where(and(eq(shifts.userId, session.userId), isNull(shifts.endedAt)))
    .get();

  if (!active) {
    return NextResponse.json(
      { error: "勤務中のシフトがありません" },
      { status: 404 }
    );
  }

  const now = new Date();
  db.update(shifts)
    .set({ endedAt: now })
    .where(eq(shifts.id, active.id))
    .run();

  emitEvent({
    type: "shift_end",
    userId: session.userId,
    userName: session.userName,
  });

  return NextResponse.json({
    shift: { ...active, startedAt: active.startedAt.getTime(), endedAt: now.getTime() },
  });
}
