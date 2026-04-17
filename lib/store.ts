"use client";

import type { Guard, Site, Shift, AttendanceRecord, User, EquipmentItem, EquipmentLending, DailyReport, LocationLog, ShiftRequest, ChatMessage, HandoverNote, InterviewCandidate } from "./types";

const DATA_VERSION = "7";

const STORAGE_KEYS = {
  version: "lsecurity_version",
  users: "lsecurity_users",
  guards: "lsecurity_guards",
  sites: "lsecurity_sites",
  shifts: "lsecurity_shifts",
  attendance: "lsecurity_attendance",
  currentUser: "lsecurity_current_user",
  equipment: "lsecurity_equipment",
  lending: "lsecurity_lending",
  reports: "lsecurity_reports",
  locations: "lsecurity_locations",
  shiftRequests: "lsecurity_shift_requests",
  chat: "lsecurity_chat",
  handover: "lsecurity_handover",
  interviews: "lsecurity_interviews",
} as const;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// In-memory cache to avoid redundant JSON.parse on repeated reads within the same tick.
// Invalidated when setItem writes to that key.
const cache = new Map<string, unknown>();

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? JSON.parse(raw) : fallback;
    cache.set(key, value);
    return value;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  cache.set(key, value);
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
    licenses: ["普通自動車免許", "救急救命講習修了"], skillLevel: "advanced", experienceYears: 8,
    hourlyRate: 1200, nightHourlyRate: 1500, shiftPreference: "both",
    trainingStatus: "none", notes: "夜勤対応可", status: "active", createdAt: "2025-01-15",
  },
  {
    id: "g2", name: "鈴木 花子", nameKana: "スズキ ハナコ", phone: "090-2345-6789",
    email: "suzuki@lsecurity.jp", certifications: ["施設警備業務検定1級"],
    licenses: ["普通自動車免許", "防火管理者", "上級救命講習修了"], skillLevel: "expert", experienceYears: 15,
    hourlyRate: 1500, nightHourlyRate: 1875, shiftPreference: "both",
    trainingStatus: "none", notes: "指導員としても活動", status: "active", createdAt: "2025-02-01",
  },
  {
    id: "g3", name: "佐藤 次郎", nameKana: "サトウ ジロウ", phone: "090-3456-7890",
    email: "sato@lsecurity.jp", certifications: ["交通誘導警備業務検定1級", "雑踏警備業務検定2級"],
    licenses: ["普通自動車免許", "中型自動車免許"], skillLevel: "advanced", experienceYears: 5,
    hourlyRate: 1200, nightHourlyRate: 1500, shiftPreference: "day_only",
    trainingStatus: "ongoing", notes: "現任教育受講中", status: "active", createdAt: "2025-03-10",
  },
  {
    id: "g4", name: "高橋 美咲", nameKana: "タカハシ ミサキ", phone: "090-4567-8901",
    email: "takahashi@lsecurity.jp", certifications: ["施設警備業務検定2級"],
    licenses: ["普通自動車免許"], skillLevel: "intermediate", experienceYears: 2,
    hourlyRate: 1100, nightHourlyRate: 1375, shiftPreference: "day_only",
    trainingStatus: "none", notes: "", status: "active", createdAt: "2025-04-01",
  },
  {
    id: "g5", name: "渡辺 健一", nameKana: "ワタナベ ケンイチ", phone: "090-5678-9012",
    email: "watanabe@lsecurity.jp", certifications: [],
    licenses: [], skillLevel: "beginner", experienceYears: 0,
    hourlyRate: 1000, nightHourlyRate: 1250, shiftPreference: "any",
    trainingStatus: "new_hire", notes: "新任教育受講中", status: "active", createdAt: "2024-11-20",
  },
];

const SEED_SITES: Site[] = [
  {
    id: "s1", name: "ABCモール 常駐警備", clientName: "ABC商業施設株式会社",
    address: "東京都新宿区西新宿1-1-1", type: "facility", phone: "03-1234-5678",
    startDate: "2025-01-20", endDate: "2026-01-19",
    requiredGuards: 3, requiredCertifications: ["施設警備業務検定2級"],
    notes: "正面入口・駐車場の巡回。24時間体制。", status: "active", createdAt: "2025-01-20",
  },
  {
    id: "s2", name: "新宿駅前 再開発工事", clientName: "大成建設株式会社",
    address: "東京都新宿区新宿3-2-1", type: "traffic", phone: "03-2345-6789",
    startDate: "2025-02-15", endDate: "2026-08-31",
    requiredGuards: 2, requiredCertifications: ["交通誘導警備業務検定2級"],
    notes: "車両誘導、歩行者安全管理。工期18ヶ月。", status: "active", createdAt: "2025-02-15",
  },
  {
    id: "s3", name: "夏祭りイベント警備", clientName: "新宿区役所",
    address: "東京都新宿区歌舞伎町広場", type: "crowd", phone: "03-3456-7890",
    startDate: "2026-07-15", endDate: "2026-07-17",
    requiredGuards: 5, requiredCertifications: ["雑踏警備業務検定2級"],
    notes: "7月開催予定、雑踏警備。3日間。", status: "active", createdAt: "2025-03-01",
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
  { id: "sh1", guardId: "g1", siteId: "s1", date: todayStr(), startTime: "09:00", endTime: "18:00", shiftType: "day", status: "confirmed", notes: "" },
  { id: "sh2", guardId: "g2", siteId: "s1", date: todayStr(), startTime: "18:00", endTime: "06:00", shiftType: "night", status: "confirmed", notes: "夜勤" },
  { id: "sh3", guardId: "g3", siteId: "s2", date: todayStr(), startTime: "08:00", endTime: "17:00", shiftType: "day", status: "confirmed", notes: "" },
  { id: "sh4", guardId: "g1", siteId: "s2", date: daysFromNow(1), startTime: "08:00", endTime: "17:00", shiftType: "day", status: "scheduled", notes: "" },
  { id: "sh5", guardId: "g4", siteId: "s1", date: daysFromNow(1), startTime: "09:00", endTime: "18:00", shiftType: "day", status: "scheduled", notes: "" },
  { id: "sh6", guardId: "g2", siteId: "s3", date: daysFromNow(2), startTime: "10:00", endTime: "22:00", shiftType: "day", status: "scheduled", notes: "" },
  { id: "sh7", guardId: "g3", siteId: "s2", date: daysFromNow(3), startTime: "08:00", endTime: "17:00", shiftType: "day", status: "scheduled", notes: "" },
  { id: "sh8", guardId: "g4", siteId: "s2", date: daysFromNow(4), startTime: "08:00", endTime: "17:00", shiftType: "day", status: "scheduled", notes: "" },
  { id: "sh9", guardId: "g1", siteId: "s1", date: daysFromNow(5), startTime: "09:00", endTime: "18:00", shiftType: "day", status: "scheduled", notes: "" },
  { id: "sh10", guardId: "g2", siteId: "s2", date: daysFromNow(5), startTime: "08:00", endTime: "17:00", shiftType: "day", status: "scheduled", notes: "" },
  { id: "sh11", guardId: "g3", siteId: "s3", date: daysFromNow(7), startTime: "10:00", endTime: "22:00", shiftType: "day", status: "scheduled", notes: "" },
  { id: "sh12", guardId: "g1", siteId: "s3", date: daysFromNow(7), startTime: "10:00", endTime: "22:00", shiftType: "day", status: "scheduled", notes: "" },
  { id: "sh13", guardId: "g1", siteId: "s1", date: daysFromNow(2), startTime: "18:00", endTime: "06:00", shiftType: "night", status: "scheduled", notes: "夜勤" },
  { id: "sh14", guardId: "g2", siteId: "s1", date: daysFromNow(3), startTime: "18:00", endTime: "06:00", shiftType: "night", status: "scheduled", notes: "夜勤" },
];

const SEED_ATTENDANCE: AttendanceRecord[] = [
  { id: "a1", guardId: "g1", shiftId: "sh1", siteId: "s1", date: todayStr(), clockIn: "08:55", clockOut: null, status: "on_duty", notes: "" },
  { id: "a2", guardId: "g3", shiftId: "sh3", siteId: "s2", date: todayStr(), clockIn: "07:58", clockOut: null, status: "on_duty", notes: "" },
];

const SEED_EQUIPMENT: EquipmentItem[] = [
  { id: "eq1", name: "制服（夏用）", category: "uniform", totalStock: 20, notes: "" },
  { id: "eq2", name: "制服（冬用）", category: "uniform", totalStock: 20, notes: "" },
  { id: "eq3", name: "帽子", category: "uniform", totalStock: 25, notes: "" },
  { id: "eq4", name: "安全靴", category: "uniform", totalStock: 15, notes: "" },
  { id: "eq5", name: "反射ベスト", category: "uniform", totalStock: 30, notes: "交通誘導用" },
  { id: "eq6", name: "懐中電灯", category: "tool", totalStock: 20, notes: "" },
  { id: "eq7", name: "誘導棒", category: "tool", totalStock: 15, notes: "" },
  { id: "eq8", name: "トランシーバー", category: "communication", totalStock: 10, notes: "" },
  { id: "eq9", name: "警笛", category: "tool", totalStock: 25, notes: "" },
  { id: "eq10", name: "雨合羽", category: "uniform", totalStock: 15, notes: "" },
];

const SEED_LENDING: EquipmentLending[] = [
  { id: "l1", equipmentId: "eq1", guardId: "g1", quantity: 2, lentDate: "2025-01-20", returnDate: null, condition: "good", notes: "" },
  { id: "l2", equipmentId: "eq3", guardId: "g1", quantity: 1, lentDate: "2025-01-20", returnDate: null, condition: "good", notes: "" },
  { id: "l3", equipmentId: "eq6", guardId: "g1", quantity: 1, lentDate: "2025-01-20", returnDate: null, condition: "good", notes: "" },
  { id: "l4", equipmentId: "eq8", guardId: "g1", quantity: 1, lentDate: "2025-02-01", returnDate: null, condition: "good", notes: "" },
  { id: "l5", equipmentId: "eq1", guardId: "g2", quantity: 2, lentDate: "2025-02-01", returnDate: null, condition: "good", notes: "" },
  { id: "l6", equipmentId: "eq3", guardId: "g2", quantity: 1, lentDate: "2025-02-01", returnDate: null, condition: "good", notes: "" },
  { id: "l7", equipmentId: "eq5", guardId: "g3", quantity: 1, lentDate: "2025-03-10", returnDate: null, condition: "good", notes: "" },
  { id: "l8", equipmentId: "eq7", guardId: "g3", quantity: 1, lentDate: "2025-03-10", returnDate: null, condition: "good", notes: "" },
  { id: "l9", equipmentId: "eq2", guardId: "g4", quantity: 1, lentDate: "2025-04-01", returnDate: null, condition: "good", notes: "" },
];

const SEED_REPORTS: DailyReport[] = [
  {
    id: "r1", guardId: "g1", shiftId: "sh1", siteId: "s1", date: daysFromNow(-1),
    content: "施設内巡回を実施。異常なし。正面入口付近で不審者対応1件（退去済み）。駐車場のライト1箇所切れ、管理事務所に報告済み。",
    attachments: [], submittedAt: daysFromNow(-1) + "T18:30:00",
  },
  {
    id: "r2", guardId: "g2", shiftId: "sh2", siteId: "s1", date: daysFromNow(-1),
    content: "夜間巡回完了。22時頃、駐車場B区画で車上荒らし未遂あり。警察に通報し対応完了。防犯カメラ映像を保存済み。",
    attachments: [], submittedAt: daysFromNow(-1) + "T06:15:00",
  },
  {
    id: "r3", guardId: "g3", shiftId: "sh3", siteId: "s2", date: daysFromNow(-2),
    content: "交通誘導業務。大型車両搬入3回対応。歩行者誘導特に問題なし。午後から雨のため視認性に注意して業務遂行。",
    attachments: [], submittedAt: daysFromNow(-2) + "T17:10:00",
  },
];

const SEED_SHIFT_REQUESTS: ShiftRequest[] = [
  { id: "sr1", guardId: "g1", date: daysFromNow(7), startTime: "09:00", endTime: "18:00", notes: "日勤希望", status: "pending", createdAt: todayStr() },
  { id: "sr2", guardId: "g1", date: daysFromNow(8), startTime: "09:00", endTime: "18:00", notes: "", status: "pending", createdAt: todayStr() },
  { id: "sr3", guardId: "g2", date: daysFromNow(7), startTime: "18:00", endTime: "06:00", notes: "夜勤可能", status: "approved", createdAt: daysFromNow(-1) },
  { id: "sr4", guardId: "g4", date: daysFromNow(9), startTime: "08:00", endTime: "17:00", notes: "", status: "pending", createdAt: todayStr() },
];

// --- Initialize ---
const SEED_CHAT: ChatMessage[] = [
  { id: "ch1", senderId: "u1", senderName: "管理者", senderRole: "admin", receiverId: null, channel: "general", content: "本日の新宿駅前現場は大型車搬入があるため注意してください。", timestamp: daysFromNow(-1) + "T08:00:00" },
  { id: "ch2", senderId: "u2", senderName: "田中 太郎", senderRole: "guard", receiverId: null, channel: "general", content: "了解しました。", timestamp: daysFromNow(-1) + "T08:05:00" },
  { id: "ch3", senderId: "u1", senderName: "管理者", senderRole: "admin", receiverId: null, channel: "general", content: "明日のABCモール夜勤は2名体制です。鈴木さんと田中さんよろしくお願いします。", timestamp: todayStr() + "T09:00:00" },
];

const SEED_HANDOVER: HandoverNote[] = [
  { id: "h1", siteId: "s1", guardId: "g1", guardName: "田中 太郎", date: daysFromNow(-1), content: "正面入口のセンサーが反応しやすくなっています。管理事務所に報告済み。駐車場B区画のライト交換予定（来週）。", createdAt: daysFromNow(-1) + "T18:00:00" },
  { id: "h2", siteId: "s2", guardId: "g3", guardName: "佐藤 次郎", date: daysFromNow(-1), content: "午後から大型車両搬入3回あり。明日も同様の予定。歩行者誘導のポイントは北側交差点。", createdAt: daysFromNow(-1) + "T17:00:00" },
];

const SEED_INTERVIEWS: InterviewCandidate[] = [
  { id: "iv1", name: "山田 一郎", nameKana: "ヤマダ イチロウ", phone: "090-6789-0123", email: "yamada@example.com", interviewDate: daysFromNow(2), interviewTime: "10:00", status: "scheduled", notes: "警備経験3年。交通誘導希望。", createdAt: todayStr() },
  { id: "iv2", name: "中村 真理", nameKana: "ナカムラ マリ", phone: "090-7890-1234", email: "nakamura@example.com", interviewDate: daysFromNow(3), interviewTime: "14:00", status: "scheduled", notes: "未経験。施設警備希望。", createdAt: todayStr() },
  { id: "iv3", name: "小林 大輔", nameKana: "コバヤシ ダイスケ", phone: "090-8901-2345", email: "kobayashi@example.com", interviewDate: daysFromNow(-2), interviewTime: "11:00", status: "hired", notes: "前職は警備会社。即戦力。", createdAt: daysFromNow(-5) },
  { id: "iv4", name: "加藤 裕子", nameKana: "カトウ ユウコ", phone: "090-9012-3456", email: "kato@example.com", interviewDate: daysFromNow(5), interviewTime: "15:00", status: "scheduled", notes: "パート希望。日勤のみ。", createdAt: todayStr() },
];

function seedAll(): void {
  setItem(STORAGE_KEYS.users, SEED_USERS);
  setItem(STORAGE_KEYS.guards, SEED_GUARDS);
  setItem(STORAGE_KEYS.sites, SEED_SITES);
  setItem(STORAGE_KEYS.shifts, SEED_SHIFTS);
  setItem(STORAGE_KEYS.attendance, SEED_ATTENDANCE);
  setItem(STORAGE_KEYS.equipment, SEED_EQUIPMENT);
  setItem(STORAGE_KEYS.lending, SEED_LENDING);
  setItem(STORAGE_KEYS.reports, SEED_REPORTS);
  setItem(STORAGE_KEYS.shiftRequests, SEED_SHIFT_REQUESTS);
  setItem(STORAGE_KEYS.chat, SEED_CHAT);
  setItem(STORAGE_KEYS.handover, SEED_HANDOVER);
  setItem(STORAGE_KEYS.interviews, SEED_INTERVIEWS);
  localStorage.setItem(STORAGE_KEYS.version, DATA_VERSION);
}

export function initializeStore(): void {
  if (typeof window === "undefined") return;
  const currentVersion = localStorage.getItem(STORAGE_KEYS.version);
  if (!currentVersion || currentVersion !== DATA_VERSION) {
    // Clear old data and re-seed with latest schema
    const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      cache.delete(key);
    });
    seedAll();
    // Restore login session if there was one
    if (currentUser) localStorage.setItem(STORAGE_KEYS.currentUser, currentUser);
    return;
  }
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    seedAll();
  }
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
  const shifts = getShifts().map((s) =>
    s.id === shiftId ? { ...s, status: "completed" as const } : s
  );
  setItem(STORAGE_KEYS.shifts, shifts);
}

// --- Equipment ---
export function getEquipment(): EquipmentItem[] {
  return getItem<EquipmentItem[]>(STORAGE_KEYS.equipment, []);
}
export function getEquipmentItem(id: string): EquipmentItem | undefined {
  return getEquipment().find((e) => e.id === id);
}
export function addEquipment(item: Omit<EquipmentItem, "id">): EquipmentItem {
  const items = getEquipment();
  const newItem: EquipmentItem = { ...item, id: generateId() };
  items.push(newItem);
  setItem(STORAGE_KEYS.equipment, items);
  return newItem;
}

// --- Lending ---
export function getLending(): EquipmentLending[] {
  return getItem<EquipmentLending[]>(STORAGE_KEYS.lending, []);
}
export function getLendingByGuard(guardId: string): EquipmentLending[] {
  return getLending().filter((l) => l.guardId === guardId && !l.returnDate);
}
export function addLending(lending: Omit<EquipmentLending, "id">): EquipmentLending {
  const items = getLending();
  const newItem: EquipmentLending = { ...lending, id: generateId() };
  items.push(newItem);
  setItem(STORAGE_KEYS.lending, items);
  return newItem;
}
export function returnLending(id: string): void {
  const items = getLending().map((l) =>
    l.id === id ? { ...l, returnDate: todayStr() } : l
  );
  setItem(STORAGE_KEYS.lending, items);
}

// --- Daily Reports ---
export function getReports(): DailyReport[] {
  return getItem<DailyReport[]>(STORAGE_KEYS.reports, []);
}
export function getReportsByGuard(guardId: string): DailyReport[] {
  return getReports().filter((r) => r.guardId === guardId).sort((a, b) => b.date.localeCompare(a.date));
}
export function getReportsByDate(date: string): DailyReport[] {
  return getReports().filter((r) => r.date === date);
}
export function addReport(report: Omit<DailyReport, "id">): DailyReport {
  const reports = getReports();
  const newReport: DailyReport = { ...report, id: generateId() };
  reports.push(newReport);
  setItem(STORAGE_KEYS.reports, reports);
  return newReport;
}

// --- Location Logs ---
export function getLocations(): LocationLog[] {
  return getItem<LocationLog[]>(STORAGE_KEYS.locations, []);
}
export function getLatestLocations(): LocationLog[] {
  const all = getLocations();
  const latest = new Map<string, LocationLog>();
  for (const loc of all) {
    const existing = latest.get(loc.guardId);
    if (!existing || loc.timestamp > existing.timestamp) {
      latest.set(loc.guardId, loc);
    }
  }
  return Array.from(latest.values());
}
export function addLocation(loc: Omit<LocationLog, "id">): LocationLog {
  const locations = getLocations();
  const newLoc: LocationLog = { ...loc, id: generateId() };
  locations.push(newLoc);
  // Keep only last 200 entries to avoid localStorage overflow
  const trimmed = locations.slice(-200);
  setItem(STORAGE_KEYS.locations, trimmed);
  return newLoc;
}

// --- Shift Requests ---
export function getShiftRequests(): ShiftRequest[] {
  return getItem<ShiftRequest[]>(STORAGE_KEYS.shiftRequests, []);
}
export function getShiftRequestsByGuard(guardId: string): ShiftRequest[] {
  return getShiftRequests().filter((r) => r.guardId === guardId).sort((a, b) => a.date.localeCompare(b.date));
}
export function addShiftRequest(req: Omit<ShiftRequest, "id" | "createdAt">): ShiftRequest {
  const requests = getShiftRequests();
  const newReq: ShiftRequest = { ...req, id: generateId(), createdAt: todayStr() };
  requests.push(newReq);
  setItem(STORAGE_KEYS.shiftRequests, requests);
  return newReq;
}
export function updateShiftRequest(id: string, updates: Partial<ShiftRequest>, assignSiteId?: string): void {
  const requests = getShiftRequests();
  const request = requests.find((r) => r.id === id);
  const updated = requests.map((r) => (r.id === id ? { ...r, ...updates } : r));
  setItem(STORAGE_KEYS.shiftRequests, updated);

  // Auto-create shift when approved
  if (updates.status === "approved" && request) {
    const isNight = request.startTime >= "17:00" || request.endTime <= "08:00";
    addShift({
      guardId: request.guardId,
      siteId: assignSiteId ?? "",
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      shiftType: isNight ? "night" : "day",
      status: "scheduled",
      notes: assignSiteId ? "シフト希望より作成" : "シフト希望より作成（現場未割当）",
    });
  }
}

// --- Chat ---
export function getChatMessages(): ChatMessage[] {
  return getItem<ChatMessage[]>(STORAGE_KEYS.chat, []);
}
export function getChatGeneral(): ChatMessage[] {
  return getChatMessages().filter((m) => m.channel === "general").sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
export function getChatBySite(siteId: string): ChatMessage[] {
  return getChatMessages().filter((m) => m.channel === "site" && m.siteId === siteId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
export function getChatDirect(userId1: string, userId2: string): ChatMessage[] {
  return getChatMessages().filter((m) =>
    m.channel === "direct" &&
    ((m.senderId === userId1 && m.receiverId === userId2) ||
     (m.senderId === userId2 && m.receiverId === userId1))
  ).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
export function addChatMessage(msg: Omit<ChatMessage, "id" | "timestamp">): ChatMessage {
  const messages = getChatMessages();
  const newMsg: ChatMessage = { ...msg, id: generateId(), timestamp: new Date().toISOString() };
  messages.push(newMsg);
  const trimmed = messages.slice(-500);
  setItem(STORAGE_KEYS.chat, trimmed);
  return newMsg;
}

// --- Handover Notes ---
export function getHandoverNotes(): HandoverNote[] {
  return getItem<HandoverNote[]>(STORAGE_KEYS.handover, []);
}
export function getHandoverBySite(siteId: string): HandoverNote[] {
  return getHandoverNotes().filter((h) => h.siteId === siteId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function addHandoverNote(note: Omit<HandoverNote, "id" | "createdAt">): HandoverNote {
  const notes = getHandoverNotes();
  const newNote: HandoverNote = { ...note, id: generateId(), createdAt: new Date().toISOString() };
  notes.push(newNote);
  setItem(STORAGE_KEYS.handover, notes);
  return newNote;
}

// --- Notification counts ---
export function getAdminNotificationCounts(): { shiftRequests: number; missingLocation: number } {
  const pendingRequests = getShiftRequests().filter((r) => r.status === "pending").length;
  const today = todayStr();
  const todayShifts = getShifts().filter((s) => s.date === today && s.status !== "cancelled");
  const guardsWithTodayShift = new Set(todayShifts.map((s) => s.guardId));
  const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
  const recentLocGuards = new Set(getLocations().filter((l) => new Date(l.timestamp).getTime() > twelveHoursAgo).map((l) => l.guardId));
  const missingLocation = [...guardsWithTodayShift].filter((id) => !recentLocGuards.has(id)).length;
  return { shiftRequests: pendingRequests, missingLocation };
}

export function getGuardNotificationCounts(guardId: string): { nextWeekRequest: boolean; pendingHandover: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  const nextWeekStart = nextMonday.toISOString().split("T")[0];
  const hasNextWeekRequest = getShiftRequests().some((r) => r.guardId === guardId && r.date >= nextWeekStart);
  return { nextWeekRequest: !hasNextWeekRequest, pendingHandover: 0 };
}

// --- Location history for a guard ---
export function getLocationsByGuard(guardId: string): LocationLog[] {
  return getLocations().filter((l) => l.guardId === guardId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// --- Interview Candidates ---
export function getInterviews(): InterviewCandidate[] {
  return getItem<InterviewCandidate[]>(STORAGE_KEYS.interviews, []);
}
export function addInterview(interview: Omit<InterviewCandidate, "id" | "createdAt">): InterviewCandidate {
  const interviews = getInterviews();
  const newInterview: InterviewCandidate = { ...interview, id: generateId(), createdAt: todayStr() };
  interviews.push(newInterview);
  setItem(STORAGE_KEYS.interviews, interviews);
  return newInterview;
}
export function updateInterview(id: string, updates: Partial<InterviewCandidate>): void {
  const interviews = getInterviews().map((i) => (i.id === id ? { ...i, ...updates } : i));
  setItem(STORAGE_KEYS.interviews, interviews);
}
