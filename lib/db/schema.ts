import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "employee"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [
  index("sessions_user_id_idx").on(t.userId),
]);

export const shifts = sqliteTable("shifts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp_ms" }),
  adminNote: text("admin_note"),
}, (t) => [
  index("shifts_user_id_idx").on(t.userId),
  index("shifts_ended_at_idx").on(t.endedAt),
  index("shifts_started_at_idx").on(t.startedAt),
]);

export const gpsLogs = sqliteTable("gps_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shiftId: text("shift_id")
    .notNull()
    .references(() => shifts.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  accuracy: real("accuracy"),
  recordedAt: integer("recorded_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [
  index("gps_logs_shift_id_idx").on(t.shiftId),
  index("gps_logs_user_id_idx").on(t.userId),
  index("gps_logs_recorded_at_idx").on(t.recordedAt),
  index("gps_logs_shift_recorded_idx").on(t.shiftId, t.recordedAt),
]);

export const geofences = sqliteTable("geofences", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radiusM: real("radius_m").notNull(),
  type: text("type", { enum: ["allowed", "forbidden"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: text("actor_id").references(() => users.id),
  actorName: text("actor_name"),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  detail: text("detail"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [
  index("audit_logs_created_at_idx").on(t.createdAt),
  index("audit_logs_action_idx").on(t.action),
]);

export const shiftActivities = sqliteTable("shift_activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shiftId: text("shift_id")
    .notNull()
    .references(() => shifts.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  activity: text("activity").notNull(),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [
  index("shift_activities_shift_id_idx").on(t.shiftId),
]);

export const audioRecordings = sqliteTable("audio_recordings", {
  id: text("id").primaryKey(),
  shiftId: text("shift_id")
    .notNull()
    .references(() => shifts.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  filePath: text("file_path").notNull(),
  durationSec: integer("duration_sec"),
  recordedAt: integer("recorded_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [
  index("audio_recordings_shift_id_idx").on(t.shiftId),
  index("audio_recordings_user_id_idx").on(t.userId),
  index("audio_recordings_recorded_at_idx").on(t.recordedAt),
]);
