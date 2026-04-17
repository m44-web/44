// Haversine formula: distance between two GPS points in meters
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export type ActivityStatus = "active" | "idle" | "stale" | "no_gps";

export interface ActivityEvaluation {
  status: ActivityStatus;
  message: string;
  lastMovementAt: number | null;
  distanceLast10Min: number;
}

const STALE_THRESHOLD_MS = 2 * 60 * 1000; // GPS送信なし2分でstale
const IDLE_DISTANCE_M = 50; // 50m以内
const IDLE_TIME_WINDOW_MS = 10 * 60 * 1000; // 10分間
const IDLE_MIN_POINTS = 3;

export function evaluateActivity(
  points: Array<{ latitude: number; longitude: number; recordedAt: number }>
): ActivityEvaluation {
  if (points.length === 0) {
    return {
      status: "no_gps",
      message: "GPS未受信",
      lastMovementAt: null,
      distanceLast10Min: 0,
    };
  }

  const latest = points[0];
  const now = Date.now();
  const ageMs = now - latest.recordedAt;

  if (ageMs > STALE_THRESHOLD_MS) {
    return {
      status: "stale",
      message: `GPS${Math.floor(ageMs / 60000)}分間未更新`,
      lastMovementAt: latest.recordedAt,
      distanceLast10Min: 0,
    };
  }

  // Check last 10 minutes window
  const windowStart = now - IDLE_TIME_WINDOW_MS;
  const windowPoints = points.filter((p) => p.recordedAt >= windowStart);

  let totalDistance = 0;
  for (let i = 0; i < windowPoints.length - 1; i++) {
    totalDistance += haversineMeters(
      windowPoints[i].latitude,
      windowPoints[i].longitude,
      windowPoints[i + 1].latitude,
      windowPoints[i + 1].longitude
    );
  }

  if (
    windowPoints.length >= IDLE_MIN_POINTS &&
    totalDistance < IDLE_DISTANCE_M &&
    windowPoints[windowPoints.length - 1].recordedAt <
      now - IDLE_TIME_WINDOW_MS * 0.5
  ) {
    return {
      status: "idle",
      message: `${Math.round(totalDistance)}m以内に停滞中`,
      lastMovementAt: latest.recordedAt,
      distanceLast10Min: totalDistance,
    };
  }

  return {
    status: "active",
    message: "稼働中",
    lastMovementAt: latest.recordedAt,
    distanceLast10Min: totalDistance,
  };
}
