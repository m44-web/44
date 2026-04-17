import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, shifts, gpsLogs, audioRecordings, sessions, auditLogs, geofences } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, isNull, gt, and } from "drizzle-orm";
import { statSync } from "fs";
import { join } from "path";

export async function GET() {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const totalUsers = db.select().from(users).all().length;
  const activeUsers = db.select().from(users).where(isNull(users.deactivatedAt)).all().length;
  const totalShifts = db.select().from(shifts).all().length;
  const activeShifts = db.select().from(shifts).where(isNull(shifts.endedAt)).all().length;
  const totalGpsPoints = db.select().from(gpsLogs).all().length;
  const totalRecordings = db.select().from(audioRecordings).all().length;
  const activeSessions = db.select().from(sessions).where(gt(sessions.expiresAt, new Date())).all().length;
  const totalAuditLogs = db.select().from(auditLogs).all().length;
  const totalGeofences = db.select().from(geofences).all().length;
  const adminCount = db.select().from(users).where(and(eq(users.role, "admin"), isNull(users.deactivatedAt))).all().length;

  let dbSizeBytes = 0;
  try {
    const dbPath = join(process.cwd(), "data", "monitor.db");
    dbSizeBytes = statSync(dbPath).size;
  } catch {
    // ignore
  }

  return NextResponse.json({
    db: {
      sizeBytes: dbSizeBytes,
      sizeMB: Math.round(dbSizeBytes / 1024 / 1024 * 100) / 100,
    },
    counts: {
      users: totalUsers,
      activeUsers,
      admins: adminCount,
      shifts: totalShifts,
      activeShifts,
      gpsPoints: totalGpsPoints,
      recordings: totalRecordings,
      activeSessions,
      auditLogs: totalAuditLogs,
      geofences: totalGeofences,
    },
    uptime: process.uptime(),
    nodeVersion: process.version,
    timestamp: Date.now(),
  });
}
