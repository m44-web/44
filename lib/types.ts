export type UserRole = "admin" | "guard";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  guardId?: string;
};

export type Guard = {
  id: string;
  name: string;
  nameKana: string;
  phone: string;
  email: string;
  certifications: string[];
  status: "active" | "inactive";
  createdAt: string;
};

export type Site = {
  id: string;
  name: string;
  clientName: string;
  address: string;
  type: "facility" | "event" | "traffic" | "crowd";
  phone: string;
  notes: string;
  status: "active" | "inactive";
  createdAt: string;
};

export type Shift = {
  id: string;
  guardId: string;
  siteId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes: string;
};

export type AttendanceRecord = {
  id: string;
  guardId: string;
  shiftId: string;
  siteId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: "pending" | "on_duty" | "completed" | "absent";
  notes: string;
};

export const SITE_TYPE_LABELS: Record<Site["type"], string> = {
  facility: "施設警備",
  event: "イベント警備",
  traffic: "交通誘導",
  crowd: "雑踏警備",
};

export const SHIFT_STATUS_LABELS: Record<Shift["status"], string> = {
  scheduled: "予定",
  confirmed: "確定",
  completed: "完了",
  cancelled: "キャンセル",
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceRecord["status"], string> = {
  pending: "未出勤",
  on_duty: "勤務中",
  completed: "勤務完了",
  absent: "欠勤",
};

export const CERTIFICATION_OPTIONS = [
  "施設警備業務検定1級",
  "施設警備業務検定2級",
  "交通誘導警備業務検定1級",
  "交通誘導警備業務検定2級",
  "雑踏警備業務検定1級",
  "雑踏警備業務検定2級",
  "貴重品運搬警備業務検定",
  "核燃料物質等危険物運搬警備業務検定",
  "空港保安警備業務検定",
  "指導教育責任者",
] as const;
