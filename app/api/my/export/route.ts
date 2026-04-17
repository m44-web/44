import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts, gpsLogs } from "@/lib/db/schema";
import { eq, gte, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function fmt(ts: Date | null): string {
  if (!ts) return "";
  return ts.toISOString();
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type") ?? "shifts";
  const sinceDays = parseInt(request.nextUrl.searchParams.get("days") ?? "30", 10);
  const since = new Date(Date.now() - Math.min(sinceDays, 365) * 24 * 3600 * 1000);

  let csv = "";
  let filename = "";

  if (type === "shifts") {
    filename = `my_shifts_${new Date().toISOString().slice(0, 10)}.csv`;
    const rows = db
      .select()
      .from(shifts)
      .where(and(eq(shifts.userId, session.userId), gte(shifts.startedAt, since)))
      .all();

    const header = ["開始日時", "終了日時", "勤務時間(分)"];
    const lines = [header.join(",")];
    for (const r of rows) {
      const end = r.endedAt?.getTime() ?? Date.now();
      const durationMin = Math.floor((end - r.startedAt.getTime()) / 60000);
      lines.push(
        [csvEscape(fmt(r.startedAt)), csvEscape(fmt(r.endedAt)), csvEscape(durationMin)].join(",")
      );
    }
    csv = lines.join("\n");
  } else if (type === "gps") {
    filename = `my_gps_${new Date().toISOString().slice(0, 10)}.csv`;
    const rows = db
      .select()
      .from(gpsLogs)
      .where(and(eq(gpsLogs.userId, session.userId), gte(gpsLogs.recordedAt, since)))
      .all();

    const header = ["緯度", "経度", "精度(m)", "記録日時"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [csvEscape(r.latitude), csvEscape(r.longitude), csvEscape(r.accuracy), csvEscape(fmt(r.recordedAt))].join(",")
      );
    }
    csv = lines.join("\n");
  } else {
    return NextResponse.json({ error: "無効なtypeです" }, { status: 400 });
  }

  const content = "\uFEFF" + csv;
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
