import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts, users, gpsLogs, audioRecordings } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;

  const shift = db
    .select({
      id: shifts.id,
      userId: shifts.userId,
      userName: users.name,
      userEmail: users.email,
      startedAt: shifts.startedAt,
      endedAt: shifts.endedAt,
      adminNote: shifts.adminNote,
    })
    .from(shifts)
    .innerJoin(users, eq(shifts.userId, users.id))
    .where(eq(shifts.id, id))
    .get();

  if (!shift) {
    return NextResponse.json(
      { error: "シフトが見つかりません" },
      { status: 404 }
    );
  }

  const gps = db
    .select()
    .from(gpsLogs)
    .where(eq(gpsLogs.shiftId, id))
    .orderBy(asc(gpsLogs.recordedAt))
    .all();

  const recordings = db
    .select()
    .from(audioRecordings)
    .where(eq(audioRecordings.shiftId, id))
    .orderBy(asc(audioRecordings.recordedAt))
    .all();

  return NextResponse.json({
    shift: {
      ...shift,
      startedAt: shift.startedAt.getTime(),
      endedAt: shift.endedAt?.getTime() ?? null,
    },
    gps: gps.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
      accuracy: p.accuracy,
      at: p.recordedAt.getTime(),
    })),
    recordings: recordings.map((r) => ({
      id: r.id,
      durationSec: r.durationSec,
      recordedAt: r.recordedAt.getTime(),
    })),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;

  const shift = db.select().from(shifts).where(eq(shifts.id, id)).get();
  if (!shift) {
    return NextResponse.json(
      { error: "シフトが見つかりません" },
      { status: 404 }
    );
  }
  if (shift.endedAt) {
    return NextResponse.json(
      { error: "既に終了しているシフトです" },
      { status: 409 }
    );
  }

  db.update(shifts)
    .set({ endedAt: new Date() })
    .where(eq(shifts.id, id))
    .run();

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const note =
    typeof body.adminNote === "string" ? body.adminNote.slice(0, 2000) : null;

  const shift = db.select().from(shifts).where(eq(shifts.id, id)).get();
  if (!shift) {
    return NextResponse.json(
      { error: "シフトが見つかりません" },
      { status: 404 }
    );
  }

  db.update(shifts).set({ adminNote: note }).where(eq(shifts.id, id)).run();
  return NextResponse.json({ ok: true, adminNote: note });
}
