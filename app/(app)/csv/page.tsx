"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { getGuards, getSites, getShifts, getAttendance, getReports, getShiftRequests, exportAllData, importAllData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm";
import { Card } from "@/components/ui/Card";
import type { Shift } from "@/lib/types";
import { SITE_TYPE_LABELS, SHIFT_STATUS_LABELS, ATTENDANCE_STATUS_LABELS, SKILL_LEVEL_LABELS, SHIFT_TYPE_LABELS } from "@/lib/types";

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const bom = "\uFEFF";
  const csv = bom + [headers.join(","), ...rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CsvPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleBackup() {
    const json = exportAllData();
    const bom = "\uFEFF";
    const blob = new Blob([bom + json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `lsecurity_backup_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("バックアップをダウンロードしました", "success");
  }

  async function handleRestoreClick() {
    const ok = await confirm({
      title: "データを復元",
      message: "現在のデータは上書きされます。続行しますか？",
      confirmLabel: "ファイル選択へ",
      variant: "danger",
    });
    if (!ok) return;
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "").replace(/^\uFEFF/, "");
      const result = importAllData(text);
      if (result.ok) {
        showToast("データを復元しました。再読み込みします", "success");
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showToast(`復元に失敗: ${result.error}`, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (user?.role !== "admin") {
    return <p className="text-text-secondary py-8 text-center">管理者のみアクセス可能です</p>;
  }

  const monthOptions: string[] = [];
  const now = new Date();
  for (let i = -6; i <= 1; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    monthOptions.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  function exportGuards() {
    const guards = getGuards();
    const headers = ["ID", "氏名", "フリガナ", "電話番号", "メール", "熟練度", "経験年数", "日勤時給", "夜勤時給", "勤務希望", "資格", "免許", "ステータス", "登録日"];
    const rows = guards.map((g) => [
      g.id, g.name, g.nameKana, g.phone, g.email,
      SKILL_LEVEL_LABELS[g.skillLevel], String(g.experienceYears),
      String(g.hourlyRate), String(g.nightHourlyRate), g.shiftPreference,
      g.certifications.join("; "), g.licenses.join("; "),
      g.status === "active" ? "稼働中" : "休止中", g.createdAt,
    ]);
    downloadCSV("guards.csv", headers, rows);
  }

  function exportSites() {
    const sites = getSites();
    const headers = ["ID", "現場名", "クライアント", "住所", "警備種別", "電話", "工期開始", "工期終了", "必要人数", "必要資格", "ステータス"];
    const rows = sites.map((s) => [
      s.id, s.name, s.clientName, s.address, SITE_TYPE_LABELS[s.type],
      s.phone, s.startDate ?? "", s.endDate ?? "",
      String(s.requiredGuards ?? ""), (s.requiredCertifications ?? []).join("; "),
      s.status === "active" ? "稼働中" : "休止中",
    ]);
    downloadCSV("sites.csv", headers, rows);
  }

  function exportShifts() {
    const shifts = getShifts().filter((s) => s.date.startsWith(selectedMonth));
    const guards = getGuards();
    const sites = getSites();
    const headers = ["日付", "警備員", "現場", "種別", "開始", "終了", "ステータス", "備考"];
    const rows = shifts.map((s) => [
      s.date, guards.find((g) => g.id === s.guardId)?.name ?? "",
      sites.find((st) => st.id === s.siteId)?.name ?? "",
      SHIFT_TYPE_LABELS[s.shiftType ?? "day"],
      s.startTime, s.endTime, SHIFT_STATUS_LABELS[s.status], s.notes,
    ]);
    downloadCSV(`shifts_${selectedMonth}.csv`, headers, rows);
  }

  function exportAttendance() {
    const att = getAttendance().filter((a) => a.date.startsWith(selectedMonth));
    const guards = getGuards();
    const sites = getSites();
    const headers = ["日付", "警備員", "現場", "出勤時刻", "退勤時刻", "ステータス", "勤務時間"];
    const rows = att.map((a) => {
      let hours = "";
      if (a.clockIn && a.clockOut) {
        const [ih, im] = a.clockIn.split(":").map(Number);
        const [oh, om] = a.clockOut.split(":").map(Number);
        let h = oh - ih + (om - im) / 60;
        if (h < 0) h += 24;
        hours = h.toFixed(1);
      }
      return [
        a.date, guards.find((g) => g.id === a.guardId)?.name ?? "",
        sites.find((s) => s.id === a.siteId)?.name ?? "",
        a.clockIn ?? "", a.clockOut ?? "",
        ATTENDANCE_STATUS_LABELS[a.status], hours,
      ];
    });
    downloadCSV(`attendance_${selectedMonth}.csv`, headers, rows);
  }

  function exportSalary() {
    const guards = getGuards();
    const shifts = getShifts().filter((s) => s.date.startsWith(selectedMonth) && s.status !== "cancelled");
    const attendance = getAttendance().filter((a) => a.date.startsWith(selectedMonth));
    const headers = ["警備員", "日勤回数", "夜勤回数", "日勤時間(実績)", "夜勤時間(実績)", "日勤時給", "夜勤時給", "日勤合計", "夜勤合計", "総合計"];
    function calcHFromTimes(start: string, end: string) {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      let h = eh - sh + (em - sm) / 60; if (h < 0) h += 24; return h;
    }
    const rows = guards.filter((g) => g.status === "active").map((g) => {
      const myShifts = shifts.filter((s) => s.guardId === g.id);
      const dayShifts = myShifts.filter((s) => s.shiftType !== "night");
      const nightShifts = myShifts.filter((s) => s.shiftType === "night");
      function actualH(s: Shift) {
        const att = attendance.find((a) => a.shiftId === s.id);
        if (att?.clockIn && att?.clockOut) return calcHFromTimes(att.clockIn, att.clockOut);
        return calcHFromTimes(s.startTime, s.endTime);
      }
      const dayH = dayShifts.reduce((sum, sh) => sum + actualH(sh), 0);
      const nightH = nightShifts.reduce((sum, sh) => sum + actualH(sh), 0);
      const dayPay = Math.round(dayH * g.hourlyRate);
      const nightPay = Math.round(nightH * g.nightHourlyRate);
      return [
        g.name, String(dayShifts.length), String(nightShifts.length),
        dayH.toFixed(1), nightH.toFixed(1),
        String(g.hourlyRate), String(g.nightHourlyRate),
        String(dayPay), String(nightPay), String(dayPay + nightPay),
      ];
    });
    downloadCSV(`salary_${selectedMonth}.csv`, headers, rows);
  }

  function exportReports() {
    const reports = getReports().filter((r) => r.date.startsWith(selectedMonth));
    const guards = getGuards();
    const sites = getSites();
    const headers = ["日付", "警備員", "現場", "報告内容", "提出日時"];
    const rows = reports.map((r) => [
      r.date,
      guards.find((g) => g.id === r.guardId)?.name ?? "",
      sites.find((s) => s.id === r.siteId)?.name ?? "",
      r.content,
      r.submittedAt,
    ]);
    downloadCSV(`reports_${selectedMonth}.csv`, headers, rows);
  }

  function exportShiftRequests() {
    const reqs = getShiftRequests().filter((r) => r.date.startsWith(selectedMonth));
    const guards = getGuards();
    const STATUS_LABEL: Record<string, string> = { pending: "申請中", approved: "承認", rejected: "却下" };
    const headers = ["申請日", "希望日", "警備員", "開始時刻", "終了時刻", "メモ", "ステータス"];
    const rows = reqs.map((r) => [
      (r.createdAt ?? "").split("T")[0],
      r.date,
      guards.find((g) => g.id === r.guardId)?.name ?? "",
      r.startTime,
      r.endTime,
      r.notes,
      STATUS_LABEL[r.status] ?? r.status,
    ]);
    downloadCSV(`shift_requests_${selectedMonth}.csv`, headers, rows);
  }

  const exports = [
    { label: "警備員一覧", desc: "全警備員の基本情報・資格・時給", fn: exportGuards, icon: "users", monthly: false },
    { label: "現場一覧", desc: "全現場の情報・工期・必要資格", fn: exportSites, icon: "building", monthly: false },
    { label: "シフト一覧", desc: "月別シフトの詳細データ", fn: exportShifts, icon: "calendar", monthly: true },
    { label: "シフト希望", desc: "月別のシフト希望申請・承認状況", fn: exportShiftRequests, icon: "check", monthly: true },
    { label: "勤怠記録", desc: "月別の出退勤記録・勤務時間", fn: exportAttendance, icon: "clock", monthly: true },
    { label: "給与計算", desc: "実績時間ベースの月別給与計算", fn: exportSalary, icon: "yen", monthly: true },
    { label: "日報一覧", desc: "月別の日報提出内容", fn: exportReports, icon: "file", monthly: true },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">CSV出力</h1>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">対象月</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors appearance-none cursor-pointer"
        >
          {monthOptions.map((m) => {
            const [y, mo] = m.split("-");
            return <option key={m} value={m}>{y}年{parseInt(mo)}月</option>;
          })}
        </select>
      </div>

      <div className="space-y-2">
        {exports.map((ex) => (
          <Card key={ex.label} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-text-primary">{ex.label}</p>
              <p className="text-xs text-text-secondary">{ex.desc}{ex.monthly ? ` (${selectedMonth})` : ""}</p>
            </div>
            <button
              onClick={ex.fn}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dark cursor-pointer transition-colors shrink-0 active:scale-95"
            >
              ダウンロード
            </button>
          </Card>
        ))}
      </div>

      <p className="text-xs text-text-secondary">※ CSVファイルはUTF-8(BOM付き)で出力されます。Excelで直接開けます。</p>

      {/* Backup / Restore */}
      <div className="pt-4 mt-4 border-t border-border">
        <h2 className="text-base font-semibold text-text-primary mb-2">データバックアップ</h2>
        <p className="text-xs text-text-secondary mb-3">すべてのデータをJSON形式でバックアップ/復元します。端末の買い替えや障害時の復旧に利用できます。</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleBackup}
            className="py-3 rounded-lg bg-success text-white text-sm font-medium hover:opacity-90 cursor-pointer transition-opacity inline-flex items-center justify-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            バックアップを出力
          </button>
          <button
            onClick={handleRestoreClick}
            className="py-3 rounded-lg border border-danger/30 text-danger text-sm font-medium hover:bg-danger/5 cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            復元（危険）
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
