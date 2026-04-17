import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts, users, gpsLogs } from "@/lib/db/schema";
import { eq, gte, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function fmt(ts: Date | null): string {
  if (!ts) return "";
  return ts.toISOString();
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const type = request.nextUrl.searchParams.get("type") ?? "shifts";
  const userId = request.nextUrl.searchParams.get("userId");
  const sinceDays = parseInt(
    request.nextUrl.searchParams.get("days") ?? "30",
    10
  );
  const since = new Date(Date.now() - sinceDays * 24 * 3600 * 1000);

  let csv = "";
  let filename = "";

  if (type === "shifts") {
    filename = `shifts_${new Date().toISOString().slice(0, 10)}.csv`;
    const query = db
      .select({
        shiftId: shifts.id,
        userId: shifts.userId,
        userName: users.name,
        userEmail: users.email,
        startedAt: shifts.startedAt,
        endedAt: shifts.endedAt,
      })
      .from(shifts)
      .innerJoin(users, eq(shifts.userId, users.id));

    const rows = userId
      ? query.where(and(eq(shifts.userId, userId), gte(shifts.startedAt, since))).all()
      : query.where(gte(shifts.startedAt, since)).all();

    const header = ["shift_id", "user_id", "name", "email", "started_at", "ended_at", "duration_sec"];
    const lines = [header.join(",")];
    for (const r of rows) {
      const end = r.endedAt?.getTime() ?? Date.now();
      const durationSec = Math.floor((end - r.startedAt.getTime()) / 1000);
      lines.push(
        [
          csvEscape(r.shiftId),
          csvEscape(r.userId),
          csvEscape(r.userName),
          csvEscape(r.userEmail),
          csvEscape(fmt(r.startedAt)),
          csvEscape(fmt(r.endedAt)),
          csvEscape(durationSec),
        ].join(",")
      );
    }
    csv = lines.join("\n");
  } else if (type === "gps") {
    filename = `gps_${new Date().toISOString().slice(0, 10)}.csv`;
    const query = db
      .select({
        userId: gpsLogs.userId,
        userName: users.name,
        shiftId: gpsLogs.shiftId,
        latitude: gpsLogs.latitude,
        longitude: gpsLogs.longitude,
        accuracy: gpsLogs.accuracy,
        recordedAt: gpsLogs.recordedAt,
      })
      .from(gpsLogs)
      .innerJoin(users, eq(gpsLogs.userId, users.id));

    const rows = userId
      ? query.where(and(eq(gpsLogs.userId, userId), gte(gpsLogs.recordedAt, since))).all()
      : query.where(gte(gpsLogs.recordedAt, since)).all();

    const header = ["user_id", "name", "shift_id", "latitude", "longitude", "accuracy", "recorded_at"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          csvEscape(r.userId),
          csvEscape(r.userName),
          csvEscape(r.shiftId),
          csvEscape(r.latitude),
          csvEscape(r.longitude),
          csvEscape(r.accuracy),
          csvEscape(fmt(r.recordedAt)),
        ].join(",")
      );
    }
    csv = lines.join("\n");
  } else {
    return NextResponse.json({ error: "無効なtypeです" }, { status: 400 });
  }

  // UTF-8 BOM so Excel opens it with correct encoding
  const content = "\uFEFF" + csv;

  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
