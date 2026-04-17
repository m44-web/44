import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

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
});

export const shifts = sqliteTable("shifts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp_ms" }),
});

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
});

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
});
