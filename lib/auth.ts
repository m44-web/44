import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { sessions, users } from "./db/schema";
import { eq, and, gt, lt } from "drizzle-orm";

const SALT_LEN = 16;
const KEY_LEN = 64;
const SESSION_COOKIE = "session_id";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashBuf = Buffer.from(hash, "hex");
  const derivedBuf = scryptSync(password, salt, KEY_LEN);
  return timingSafeEqual(hashBuf, derivedBuf);
}

export function generateId(): string {
  return randomBytes(16).toString("hex");
}

// Keep cleanup rate-limited to avoid hammering the DB on every login
let lastCleanup = 0;
function maybeCleanExpiredSessions() {
  const now = Date.now();
  if (now - lastCleanup < 60 * 60 * 1000) return;
  lastCleanup = now;
  try {
    db.delete(sessions).where(lt(sessions.expiresAt, new Date())).run();
  } catch {
    // ignore
  }
}

export async function createSession(userId: string): Promise<string> {
  maybeCleanExpiredSessions();

  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  db.insert(sessions).values({ id: sessionId, userId, expiresAt }).run();

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return sessionId;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const result = db
    .select({
      sessionId: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      userName: users.name,
      userEmail: users.email,
      userRole: users.role,
      deactivatedAt: users.deactivatedAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .get();

  if (!result) return null;
  if (result.deactivatedAt) return null;
  return result;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    db.delete(sessions).where(eq(sessions.id, sessionId)).run();
    cookieStore.delete(SESSION_COOKIE);
  }
}
