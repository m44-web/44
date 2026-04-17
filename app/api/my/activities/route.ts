import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts, shiftActivities } from "@/lib/db/schema";
import { eq, isNull, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const activeShift = db
    .select()
    .from(shifts)
    .where(and(eq(shifts.userId, session.userId), isNull(shifts.endedAt)))
    .get();

  if (!activeShift) {
    return NextResponse.json({ error: "アクティブなシフトがありません" }, { status: 400 });
  }

  const body = await request.json();
  const activity = body.activity as string;
  const note = (body.note as string) || null;

  if (!activity || activity.length > 100) {
    return NextResponse.json({ error: "アクティビティが無効です" }, { status: 400 });
  }

  db.insert(shiftActivities)
    .values({
      shiftId: activeShift.id,
      userId: session.userId,
      activity,
      note: note && note.length > 500 ? note.slice(0, 500) : note,
      createdAt: new Date(),
    })
    .run();

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const activeShift = db
    .select()
    .from(shifts)
    .where(and(eq(shifts.userId, session.userId), isNull(shifts.endedAt)))
    .get();

  if (!activeShift) {
    return NextResponse.json({ activities: [] });
  }

  const activities = db
    .select()
    .from(shiftActivities)
    .where(eq(shiftActivities.shiftId, activeShift.id))
    .orderBy(desc(shiftActivities.createdAt))
    .all();

  return NextResponse.json({
    activities: activities.map((a) => ({
      id: a.id,
      activity: a.activity,
      note: a.note,
      createdAt: a.createdAt.getTime(),
    })),
  });
}
