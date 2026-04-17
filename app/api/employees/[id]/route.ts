import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, shifts, gpsLogs, audioRecordings, sessions } from "@/lib/db/schema";
import { eq, desc, isNull, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;

  const user = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .get();

  if (!user) {
    return NextResponse.json(
      { error: "従業員が見つかりません" },
      { status: 404 }
    );
  }

  const allShifts = db
    .select()
    .from(shifts)
    .where(eq(shifts.userId, id))
    .orderBy(desc(shifts.startedAt))
    .all();

  const activeShift = db
    .select()
    .from(shifts)
    .where(and(eq(shifts.userId, id), isNull(shifts.endedAt)))
    .get();

  // Compute total worked minutes from completed shifts
  let totalMs = 0;
  for (const s of allShifts) {
    if (s.endedAt) {
      totalMs += s.endedAt.getTime() - s.startedAt.getTime();
    }
  }

  // Total recordings for this user
  const allRecordings = db
    .select()
    .from(audioRecordings)
    .where(eq(audioRecordings.userId, id))
    .all();

  // Total GPS points
  const gpsCount = db
    .select()
    .from(gpsLogs)
    .where(eq(gpsLogs.userId, id))
    .all().length;

  return NextResponse.json({
    user: { ...user, createdAt: user.createdAt.getTime() },
    shifts: allShifts.map((s) => ({
      id: s.id,
      startedAt: s.startedAt.getTime(),
      endedAt: s.endedAt?.getTime() ?? null,
      durationMs: s.endedAt
        ? s.endedAt.getTime() - s.startedAt.getTime()
        : Date.now() - s.startedAt.getTime(),
    })),
    stats: {
      totalShifts: allShifts.length,
      completedShifts: allShifts.filter((s) => s.endedAt).length,
      totalWorkedMs: totalMs,
      isOnShift: !!activeShift,
      currentShiftId: activeShift?.id ?? null,
      totalRecordings: allRecordings.length,
      totalGpsPoints: gpsCount,
    },
  });
}

// Deactivate an employee (soft delete). Also ends any active shift and invalidates sessions.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;

  const target = db.select().from(users).where(eq(users.id, id)).get();
  if (!target) {
    return NextResponse.json(
      { error: "従業員が見つかりません" },
      { status: 404 }
    );
  }
  if (target.role !== "employee") {
    return NextResponse.json(
      { error: "管理者は無効化できません" },
      { status: 400 }
    );
  }

  const now = new Date();

  db.update(users).set({ deactivatedAt: now }).where(eq(users.id, id)).run();

  // End any active shift
  db.update(shifts)
    .set({ endedAt: now })
    .where(and(eq(shifts.userId, id), isNull(shifts.endedAt)))
    .run();

  // Invalidate all sessions for this user
  db.delete(sessions).where(eq(sessions.userId, id)).run();

  audit({
    actorId: session.userId,
    actorName: session.userName,
    action: "deactivate_employee",
    targetType: "user",
    targetId: id,
    detail: target.name,
  });

  return NextResponse.json({ ok: true });
}

// Re-activate an employee
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  db.update(users).set({ deactivatedAt: null }).where(eq(users.id, id)).run();
  return NextResponse.json({ ok: true });
}
