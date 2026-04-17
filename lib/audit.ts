import { db } from "./db";
import { auditLogs } from "./db/schema";

interface LogEntry {
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  detail?: string;
}

export function audit(entry: LogEntry) {
  try {
    db.insert(auditLogs)
      .values({
        actorId: entry.actorId ?? null,
        actorName: entry.actorName ?? null,
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        detail: entry.detail ?? null,
        createdAt: new Date(),
      })
      .run();
  } catch {
    // Audit log failures should never break the main request
  }
}
