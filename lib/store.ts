"use client";

import type { Guard, Site, Shift, AttendanceRecord, User } from "./types";

const STORAGE_KEYS = {
  users: "lsecurity_users",
  guards: "lsecurity_guards",
  sites: "lsecurity_sites",
  shifts: "lsecurity_shifts",
  attendance: "lsecurity_attendance",
  currentUser: "lsecurity_current_user",
} as const;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Seed data ---
const SEED_USERS: User[] = [
  { id: "u1", email: "admin@lsecurity.jp", name: "管理者", role: "admin" },
  { id: "u2", email: "tanaka@lsecurity.jp", name: "田中 太郎", role: "guard", guardId: "g1" },
  { id: "u3", email: "suzuki@lsecurity.jp", name: "鈴木 花子", role: "guard", guardId: "g2" },
];

const SEED_GUARDS: Guard[] = [
  {
    id: "g1", name: "田中 太郎", nameKana: "タナカ タロウ", phone: "090-1234-5678",
    email: "tanaka@lsecurity.jp", certifications: ["施設警備業務検定2級", "交通誘導警備業務検定2級"],
    status: "active", createdAt: "2025-01-15",
  },
  {
    id: "g2", name: "鈴木 花子", nameKana: "スズキ ハナコ", phone: "090-2345-6789",
    email: "suzuki@lsecurity.jp", certifications: ["施設警備業務検定1級"],
    status: "active", createdAt: "2025-02-01",
  },
  {
    id: "g3", name: "佐藤 次郎", nameKana: "サトウ ジロウ", phone: "090-3456-7890",
    email: "sato@lsecurity.jp", certifications: ["交通誘導警備業務検定1級", "雑踏警備業務検定2級"],
    status: "active", createdAt: "2025-03-10",
  },
  {
    id: "g4", name: "高橋 美咲", nameKana: "タカハシ ミサキ", phone: "090-4567-8901",
    email: "takahashi@lsecurity.jp", certifications: ["施設警備業務検定2級"],
    status: "active", createdAt: "2025-04-01",
  },
  {
    id: "g5", name: "渡辺 健一", nameKana: "ワタナベ ケンイチ", phone: "090-5678-9012",
    email: "watanabe@lsecurity.jp", certifications: [],
    status: "inactive", createdAt: "2024-11-20",
  },
];

const SEED_SITES: Site[] = [
  {
    id: "s1", name: "ABCモール 常駐警備", clientName: "ABC商業施設株式会社",
    address: "東京都新宿区西新宿1-1-1", type: "facility", phone: "03-1234-5678",
    notes: "正面入口・駐車場の巡回", status: "active", createdAt: "2025-01-20",
  },
  {
    id: "s2", name: "新宿駅前 再開発工事", clientName: "大成建設株式会社",
    address: "東京都新宿区新宿3-2-1", type: "traffic", phone: "03-2345-6789",
    notes: "車両誘導、歩行者安全管理", status: "active", createdAt: "2025-02-15",
  },
  {
    id: "s3", name: "夏祭りイベント警備", clientName: "新宿区役所",
    address: "東京都新宿区歌舞伎町広場", type: "crowd", phone: "03-3456-7890",
    notes: "7月開催予定、雑踏警備", status: "active", createdAt: "2025-03-01",
  },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

const SEED_SHIFTS: Shift[] = [
  { id: "sh1", guardId: "g1", siteId: "s1", date: todayStr(), startTime: "09:00", endTime: "18:00", status: "confirmed", notes: "" },
  { id: "sh2", guardId: "g2", siteId: "s1", date: todayStr(), startTime: "18:00", endTime: "06:00", status: "confirmed", notes: "夜勤" },
  { id: "sh3", guardId: "g3", siteId: "s2", date: todayStr(), startTime: "08:00", endTime: "17:00", status: "confirmed", notes: "" },
  { id: "sh4", guardId: "g1", siteId: "s2", date: daysFromNow(1), startTime: "08:00", endTime: "17:00", status: "scheduled", notes: "" },
  { id: "sh5", guardId: "g4", siteId: "s1", date: daysFromNow(1), startTime: "09:00", endTime: "18:00", status: "scheduled", notes: "" },
  { id: "sh6", guardId: "g2", siteId: "s3", date: daysFromNow(2), startTime: "10:00", endTime: "22:00", status: "scheduled", notes: "" },
  { id: "sh7", guardId: "g3", siteId: "s2", date: daysFromNow(3), startTime: "08:00", endTime: "17:00", status: "scheduled", notes: "" },
];

const SEED_ATTENDANCE: AttendanceRecord[] = [
  { id: "a1", guardId: "g1", shiftId: "sh1", siteId: "s1", date: todayStr(), clockIn: "08:55", clockOut: null, status: "on_duty", notes: "" },
  { id: "a2", guardId: "g3", shiftId: "sh3", siteId: "s2", date: todayStr(), clockIn: "07:58", clockOut: null, status: "on_duty", notes: "" },
];

// --- Initialize ---
export function initializeStore(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEYS.users)) return;
  setItem(STORAGE_KEYS.users, SEED_USERS);
  setItem(STORAGE_KEYS.guards, SEED_GUARDS);
  setItem(STORAGE_KEYS.sites, SEED_SITES);
  setItem(STORAGE_KEYS.shifts, SEED_SHIFTS);
  setItem(STORAGE_KEYS.attendance, SEED_ATTENDANCE);
}

// --- Auth ---
export function login(email: string, _password: string): User | null {
  const users = getItem<User[]>(STORAGE_KEYS.users, []);
  return users.find((u) => u.email === email) ?? null;
}

export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.currentUser, null);
}

export function setCurrentUser(user: User | null): void {
  setItem(STORAGE_KEYS.currentUser, user);
}

// --- Guards ---
export function getGuards(): Guard[] {
  return getItem<Guard[]>(STORAGE_KEYS.guards, []);
}

export function getGuard(id: string): Guard | undefined {
  return getGuards().find((g) => g.id === id);
}

export function addGuard(guard: Omit<Guard, "id" | "createdAt">): Guard {
  const guards = getGuards();
  const newGuard: Guard = { ...guard, id: generateId(), createdAt: todayStr() };
  guards.push(newGuard);
  setItem(STORAGE_KEYS.guards, guards);
  return newGuard;
}

export function updateGuard(id: string, updates: Partial<Guard>): void {
  const guards = getGuards().map((g) => (g.id === id ? { ...g, ...updates } : g));
  setItem(STORAGE_KEYS.guards, guards);
}

// --- Sites ---
export function getSites(): Site[] {
  return getItem<Site[]>(STORAGE_KEYS.sites, []);
}

export function getSite(id: string): Site | undefined {
  return getSites().find((s) => s.id === id);
}

export function addSite(site: Omit<Site, "id" | "createdAt">): Site {
  const sites = getSites();
  const newSite: Site = { ...site, id: generateId(), createdAt: todayStr() };
  sites.push(newSite);
  setItem(STORAGE_KEYS.sites, sites);
  return newSite;
}

export function updateSite(id: string, updates: Partial<Site>): void {
  const sites = getSites().map((s) => (s.id === id ? { ...s, ...updates } : s));
  setItem(STORAGE_KEYS.sites, sites);
}

// --- Shifts ---
export function getShifts(): Shift[] {
  return getItem<Shift[]>(STORAGE_KEYS.shifts, []);
}

export function getShiftsByDate(date: string): Shift[] {
  return getShifts().filter((s) => s.date === date);
}

export function getShiftsByGuard(guardId: string): Shift[] {
  return getShifts().filter((s) => s.guardId === guardId);
}

export function addShift(shift: Omit<Shift, "id">): Shift {
  const shifts = getShifts();
  const newShift: Shift = { ...shift, id: generateId() };
  shifts.push(newShift);
  setItem(STORAGE_KEYS.shifts, shifts);
  return newShift;
}

export function updateShift(id: string, updates: Partial<Shift>): void {
  const shifts = getShifts().map((s) => (s.id === id ? { ...s, ...updates } : s));
  setItem(STORAGE_KEYS.shifts, shifts);
}

// --- Attendance ---
export function getAttendance(): AttendanceRecord[] {
  return getItem<AttendanceRecord[]>(STORAGE_KEYS.attendance, []);
}

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  return getAttendance().filter((a) => a.date === date);
}

export function getAttendanceByGuard(guardId: string): AttendanceRecord[] {
  return getAttendance().filter((a) => a.guardId === guardId);
}

export function clockIn(shiftId: string): void {
  const attendance = getAttendance();
  const shifts = getShifts();
  const shift = shifts.find((s) => s.id === shiftId);
  if (!shift) return;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const existing = attendance.find((a) => a.shiftId === shiftId);
  if (existing) {
    const updated = attendance.map((a) =>
      a.shiftId === shiftId ? { ...a, clockIn: timeStr, status: "on_duty" as const } : a
    );
    setItem(STORAGE_KEYS.attendance, updated);
  } else {
    const record: AttendanceRecord = {
      id: generateId(), guardId: shift.guardId, shiftId, siteId: shift.siteId,
      date: todayStr(), clockIn: timeStr, clockOut: null, status: "on_duty", notes: "",
    };
    attendance.push(record);
    setItem(STORAGE_KEYS.attendance, attendance);
  }
}

export function clockOut(shiftId: string): void {
  const attendance = getAttendance();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const updated = attendance.map((a) =>
    a.shiftId === shiftId ? { ...a, clockOut: timeStr, status: "completed" as const } : a
  );
  setItem(STORAGE_KEYS.attendance, updated);
  // Also mark shift as completed
  const shifts = getShifts().map((s) =>
    s.id === shiftId ? { ...s, status: "completed" as const } : s
  );
  setItem(STORAGE_KEYS.shifts, shifts);
}
