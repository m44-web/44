import { db } from "./db";
import { shifts, gpsLogs, users, geofences } from "./db/schema";
import { isNull, gte, eq, desc, and, lte } from "drizzle-orm";
import { evaluateActivity, haversineMeters } from "./activity";
import { eventBus } from "./event-bus";

const LOOKBACK_MS = 15 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;
const MAX_SHIFT_MS = 12 * 60 * 60 * 1000;

// Track which (userId:status) pairs have already alerted, to avoid spam
const alerted = new Set<string>();

declare const globalThis: {
  __alertMonitorStarted?: boolean;
};

function checkOnce() {
  try {
    const windowStart = new Date(Date.now() - LOOKBACK_MS);
    const fences = db.select().from(geofences).all();

    const activeShifts = db
      .select({
        shiftId: shifts.id,
        userId: shifts.userId,
        userName: users.name,
      })
      .from(shifts)
      .innerJoin(users, eq(shifts.userId, users.id))
      .where(isNull(shifts.endedAt))
      .all();

    const currentKeys = new Set<string>();

    for (const shift of activeShifts) {
      const latestGps = db
        .select()
        .from(gpsLogs)
        .where(
          and(
            eq(gpsLogs.shiftId, shift.shiftId),
            eq(gpsLogs.userId, shift.userId)
          )
        )
        .orderBy(desc(gpsLogs.recordedAt))
        .limit(1)
        .get();

      const recentGps = db
        .select()
        .from(gpsLogs)
        .where(
          and(
            eq(gpsLogs.shiftId, shift.shiftId),
            gte(gpsLogs.recordedAt, windowStart)
          )
        )
        .orderBy(desc(gpsLogs.recordedAt))
        .all();

      const activity = evaluateActivity(
        recentGps.map((p) => ({
          latitude: p.latitude,
          longitude: p.longitude,
          recordedAt: p.recordedAt.getTime(),
        }))
      );

      // Activity alerts
      if (activity.status === "idle" || activity.status === "stale") {
        const key = `${shift.userId}:activity:${activity.status}`;
        currentKeys.add(key);
        if (!alerted.has(key)) {
          alerted.add(key);
          eventBus.emit("app_event", {
            type: "activity_alert",
            userId: shift.userId,
            userName: shift.userName,
            status: activity.status,
            message: activity.message,
          });
        }
      }

      // Geofence alerts
      if (latestGps && fences.length > 0) {
        const matches = fences
          .map((f) => ({
            type: f.type,
            distance: haversineMeters(
              f.latitude,
              f.longitude,
              latestGps.latitude,
              latestGps.longitude
            ),
            radius: f.radiusM,
          }))
          .filter((f) => f.distance <= f.radius);

        const allowedFences = fences.filter((f) => f.type === "allowed");
        const insideAnyAllowed = matches.some((m) => m.type === "allowed");
        const insideForbidden = matches.some((m) => m.type === "forbidden");
        const violation =
          insideForbidden ||
          (allowedFences.length > 0 && !insideAnyAllowed);

        if (violation) {
          const key = `${shift.userId}:geofence`;
          currentKeys.add(key);
          if (!alerted.has(key)) {
            alerted.add(key);
            eventBus.emit("app_event", {
              type: "geofence_alert",
              userId: shift.userId,
              userName: shift.userName,
              message: insideForbidden ? "禁止エリア内" : "許可エリア外",
            });
          }
        }
      }
    }

    // Auto-end shifts that exceed max duration
    const maxCutoff = new Date(Date.now() - MAX_SHIFT_MS);
    const overdueShifts = db
      .select({ id: shifts.id, userId: shifts.userId })
      .from(shifts)
      .where(and(isNull(shifts.endedAt), lte(shifts.startedAt, maxCutoff)))
      .all();

    for (const s of overdueShifts) {
      db.update(shifts)
        .set({ endedAt: new Date() })
        .where(eq(shifts.id, s.id))
        .run();

      const userName = activeShifts.find((a) => a.userId === s.userId)?.userName ?? "不明";
      eventBus.emit("app_event", {
        type: "shift_end",
        userId: s.userId,
        userName,
      });
      eventBus.emit("app_event", {
        type: "activity_alert",
        userId: s.userId,
        userName,
        status: "auto_ended",
        message: "12時間超過により自動終了",
      });
    }

    // Clear stale alert keys so they can fire again later
    for (const key of Array.from(alerted)) {
      if (!currentKeys.has(key)) alerted.delete(key);
    }
  } catch {
    // silently ignore - this is a background task
  }
}

export function startAlertMonitor() {
  if (globalThis.__alertMonitorStarted) return;
  globalThis.__alertMonitorStarted = true;

  setTimeout(() => {
    checkOnce();
    setInterval(checkOnce, CHECK_INTERVAL_MS);
  }, 5000);
}
