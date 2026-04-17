import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gpsLogs, auditLogs, audioRecordings } from "@/lib/db/schema";
import { lt } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { unlinkSync, existsSync } from "fs";
import { join } from "path";

const DEFAULT_GPS_RETENTION_DAYS = 90;
const DEFAULT_AUDIT_RETENTION_DAYS = 180;
const DEFAULT_AUDIO_RETENTION_DAYS = 30;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const gpsDays = body.gpsDays ?? DEFAULT_GPS_RETENTION_DAYS;
  const auditDays = body.auditDays ?? DEFAULT_AUDIT_RETENTION_DAYS;
  const audioDays = body.audioDays ?? DEFAULT_AUDIO_RETENTION_DAYS;

  const now = Date.now();
  const gpsCutoff = new Date(now - gpsDays * 24 * 3600 * 1000);
  const auditCutoff = new Date(now - auditDays * 24 * 3600 * 1000);
  const audioCutoff = new Date(now - audioDays * 24 * 3600 * 1000);

  const gpsDeleted = db
    .delete(gpsLogs)
    .where(lt(gpsLogs.recordedAt, gpsCutoff))
    .run();

  const auditDeleted = db
    .delete(auditLogs)
    .where(lt(auditLogs.createdAt, auditCutoff))
    .run();

  const oldAudio = db
    .select({ id: audioRecordings.id, filePath: audioRecordings.filePath })
    .from(audioRecordings)
    .where(lt(audioRecordings.recordedAt, audioCutoff))
    .all();

  let audioFilesDeleted = 0;
  for (const rec of oldAudio) {
    const fullPath = join(process.cwd(), "data", "audio", rec.filePath);
    try {
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
        audioFilesDeleted++;
      }
    } catch {
      // skip files that can't be deleted
    }
  }

  const audioDeleted = db
    .delete(audioRecordings)
    .where(lt(audioRecordings.recordedAt, audioCutoff))
    .run();

  audit({
    actorId: session.userId,
    actorName: session.userName,
    action: "data_cleanup",
    detail: `GPS: ${gpsDeleted.changes}件, 監査: ${auditDeleted.changes}件, 音声: ${audioDeleted.changes}件(ファイル ${audioFilesDeleted}件)`,
  });

  return NextResponse.json({
    gpsDeleted: gpsDeleted.changes,
    auditDeleted: auditDeleted.changes,
    audioDeleted: audioDeleted.changes,
    audioFilesDeleted,
    retentionDays: { gpsDays, auditDays, audioDays },
  });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const now = Date.now();
  const gpsCutoff = new Date(now - DEFAULT_GPS_RETENTION_DAYS * 24 * 3600 * 1000);
  const auditCutoff = new Date(now - DEFAULT_AUDIT_RETENTION_DAYS * 24 * 3600 * 1000);
  const audioCutoff = new Date(now - DEFAULT_AUDIO_RETENTION_DAYS * 24 * 3600 * 1000);

  const gpsOld = db.select().from(gpsLogs).where(lt(gpsLogs.recordedAt, gpsCutoff)).all().length;
  const auditOld = db.select().from(auditLogs).where(lt(auditLogs.createdAt, auditCutoff)).all().length;
  const audioOld = db.select().from(audioRecordings).where(lt(audioRecordings.recordedAt, audioCutoff)).all().length;

  return NextResponse.json({
    deletableRecords: { gps: gpsOld, audit: auditOld, audio: audioOld },
    retentionDays: {
      gps: DEFAULT_GPS_RETENTION_DAYS,
      audit: DEFAULT_AUDIT_RETENTION_DAYS,
      audio: DEFAULT_AUDIO_RETENTION_DAYS,
    },
  });
}
