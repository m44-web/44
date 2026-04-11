export type UserRole = "admin" | "guard";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  guardId?: string;
};

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type Guard = {
  id: string;
  name: string;
  nameKana: string;
  phone: string;
  email: string;
  certifications: string[];
  licenses: string[];
  skillLevel: SkillLevel;
  experienceYears: number;
  hourlyRate: number;
  notes: string;
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

export type EquipmentItem = {
  id: string;
  name: string;
  category: "uniform" | "tool" | "vehicle" | "communication" | "other";
  totalStock: number;
  notes: string;
};

export type EquipmentLending = {
  id: string;
  equipmentId: string;
  guardId: string;
  quantity: number;
  lentDate: string;
  returnDate: string | null;
  condition: "good" | "damaged" | "lost";
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

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: "新人",
  intermediate: "一人前",
  advanced: "熟練",
  expert: "ベテラン",
};

export const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  beginner: "bg-sub-bg text-text-secondary",
  intermediate: "bg-accent/10 text-accent",
  advanced: "bg-warning/10 text-warning",
  expert: "bg-success/10 text-success",
};

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentItem["category"], string> = {
  uniform: "制服",
  tool: "道具",
  vehicle: "車両",
  communication: "通信機器",
  other: "その他",
};

export const CONDITION_LABELS: Record<EquipmentLending["condition"], string> = {
  good: "良好",
  damaged: "破損",
  lost: "紛失",
};

export type DailyReport = {
  id: string;
  guardId: string;
  shiftId: string;
  siteId: string;
  date: string;
  content: string;
  attachments: { name: string; dataUrl: string }[];
  submittedAt: string;
};

export type LocationLog = {
  id: string;
  guardId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  type: "clock_in" | "clock_out" | "periodic" | "manual";
};

export type ShiftRequest = {
  id: string;
  guardId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export const SHIFT_REQUEST_STATUS_LABELS: Record<ShiftRequest["status"], string> = {
  pending: "申請中",
  approved: "承認",
  rejected: "却下",
};

export const SHIFT_REQUEST_STATUS_COLORS: Record<ShiftRequest["status"], string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
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

export const LICENSE_OPTIONS = [
  "普通自動車免許",
  "中型自動車免許",
  "大型自動車免許",
  "自動二輪免許",
  "防火管理者",
  "救急救命講習修了",
  "上級救命講習修了",
  "安全衛生責任者",
  "フォークリフト運転技能",
] as const;
