"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const schema = z
  .object({
    currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
    newPassword: z.string().min(6, "新しいパスワードは6文字以上必要です"),
    confirmPassword: z.string().min(1, "確認のため再入力してください"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "確認用パスワードが一致しません",
    path: ["confirmPassword"],
  });

type Input = z.infer<typeof schema>;

interface NotifPrefs {
  soundEnabled: boolean;
  shiftAlerts: boolean;
  activityAlerts: boolean;
  geofenceAlerts: boolean;
}

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  soundEnabled: true,
  shiftAlerts: true,
  activityAlerts: true,
  geofenceAlerts: true,
};

function loadNotifPrefs(): NotifPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIF_PREFS;
  try {
    const s = localStorage.getItem("notif_prefs");
    if (s) return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(s) };
  } catch {}
  return DEFAULT_NOTIF_PREFS;
}

function saveNotifPrefs(prefs: NotifPrefs) {
  localStorage.setItem("notif_prefs", JSON.stringify(prefs));
}

export function SettingsPanel({
  userName,
  userEmail,
  userRole,
}: {
  userName: string;
  userEmail: string;
  userRole: string;
}) {
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [audioChunkMin, setAudioChunkMin] = useState(5);
  const [gpsIntervalSec, setGpsIntervalSec] = useState(30);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [cleanupInfo, setCleanupInfo] = useState<{
    deletableRecords: { gps: number; audit: number; audio: number; sessions?: number };
    retentionDays: { gps: number; audit: number; audio: number };
  } | null>(null);
  const [healthInfo, setHealthInfo] = useState<{
    db: { sizeMB: number };
    counts: Record<string, number>;
    uptime: number;
  } | null>(null);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(DEFAULT_NOTIF_PREFS);
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    const chunk = localStorage.getItem("audio_chunk_min");
    if (chunk) setAudioChunkMin(parseInt(chunk, 10));
    const gps = localStorage.getItem("gps_interval_sec");
    if (gps) setGpsIntervalSec(parseInt(gps, 10));
    setNotifPrefs(loadNotifPrefs());
  }, []);

  useEffect(() => {
    if (userRole !== "admin") return;
    fetch("/api/admin/health")
      .then((r) => r.json())
      .then(setHealthInfo)
      .catch(() => {});
    fetch("/api/admin/cleanup")
      .then((r) => r.json())
      .then(setCleanupInfo)
      .catch(() => {});
  }, [userRole]);

  const runCleanup = async () => {
    if (!confirm("古いデータを削除しますか？この操作は元に戻せません。")) return;
    setCleaningUp(true);
    setCleanupResult(null);
    try {
      const res = await fetch("/api/admin/cleanup", { method: "POST" });
      const data = await res.json();
      setCleanupResult(
        `GPS: ${data.gpsDeleted}件, 監査: ${data.auditDeleted}件, 音声: ${data.audioDeleted}件 を削除しました`
      );
      fetch("/api/admin/cleanup")
        .then((r) => r.json())
        .then(setCleanupInfo)
        .catch(() => {});
    } catch {
      setCleanupResult("クリーンアップに失敗しました");
    } finally {
      setCleaningUp(false);
    }
  };

  const savePrefs = () => {
    localStorage.setItem("audio_chunk_min", String(audioChunkMin));
    localStorage.setItem("gps_interval_sec", String(gpsIntervalSec));
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2000);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Input>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Input) => {
    setServerError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(json.error || "変更に失敗しました");
        return;
      }
      setSuccessMsg("パスワードを変更しました");
      reset();
    } catch {
      setServerError("通信エラーが発生しました");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const backLink = userRole === "admin" ? "/admin" : "/employee";

  return (
    <div className="min-h-screen">
      <header className="bg-surface border-b border-white/10">
        <Container className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href={backLink} className="text-text-muted hover:text-text text-sm">
              ← 戻る
            </Link>
            <h1 className="font-semibold">設定</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout} className="text-sm">
              ログアウト
            </Button>
          </div>
        </Container>
      </header>

      <Container className="py-6 space-y-6 max-w-2xl">
        <Card>
          <h2 className="font-semibold mb-4">アカウント情報</h2>
          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-text-muted">名前</dt>
            <dd>{userName}</dd>
            <dt className="text-text-muted">メール</dt>
            <dd>{userEmail}</dd>
            <dt className="text-text-muted">権限</dt>
            <dd>{userRole === "admin" ? "管理者" : "従業員"}</dd>
          </dl>
        </Card>

        {userRole === "admin" && (
          <Card>
            <h2 className="font-semibold mb-1">通知設定</h2>
            <p className="text-xs text-text-muted mb-4">
              ダッシュボードのリアルタイム通知をカスタマイズします。
            </p>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">通知音</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.soundEnabled}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, soundEnabled: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm">シフト開始/終了</span>
                  <p className="text-[10px] text-text-muted">従業員の出退勤を通知</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.shiftAlerts}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, shiftAlerts: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm">アクティビティアラート</span>
                  <p className="text-[10px] text-text-muted">アイドル・無応答を通知</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.activityAlerts}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, activityAlerts: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm">エリア違反アラート</span>
                  <p className="text-[10px] text-text-muted">ジオフェンス違反を通知</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.geofenceAlerts}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, geofenceAlerts: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
              </label>
              <div className="flex items-center gap-3 pt-1">
                <Button
                  onClick={() => {
                    saveNotifPrefs(notifPrefs);
                    setNotifSaved(true);
                    setTimeout(() => setNotifSaved(false), 2000);
                  }}
                >
                  保存
                </Button>
                {notifSaved && <span className="text-xs text-success">保存しました</span>}
              </div>
            </div>
          </Card>
        )}

        {userRole === "employee" && (
          <Card>
            <h2 className="font-semibold mb-1">記録設定</h2>
            <p className="text-xs text-text-muted mb-4">
              次回の勤務開始から適用されます。バッテリー消費が気になる場合は間隔を長めに。
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">
                  GPS送信間隔: {gpsIntervalSec}秒
                </label>
                <input
                  type="range"
                  min={15}
                  max={120}
                  step={5}
                  value={gpsIntervalSec}
                  onChange={(e) => setGpsIntervalSec(parseInt(e.target.value, 10))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-text-muted">
                  <span>15秒</span>
                  <span>2分</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">
                  音声録音チャンク: {audioChunkMin}分
                </label>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={audioChunkMin}
                  onChange={(e) => setAudioChunkMin(parseInt(e.target.value, 10))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-text-muted">
                  <span>1分</span>
                  <span>15分</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={savePrefs}>保存</Button>
                {prefsSaved && (
                  <span className="text-xs text-success">保存しました</span>
                )}
              </div>
            </div>
          </Card>
        )}

        {userRole === "admin" && cleanupInfo && (
          <Card>
            <h2 className="font-semibold mb-1">データ保持ポリシー</h2>
            <p className="text-xs text-text-muted mb-4">
              保持期間を超えた古いデータを削除できます。
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">GPSログ</p>
                <p className="font-bold">{cleanupInfo.deletableRecords.gps}件</p>
                <p className="text-[10px] text-text-muted">{cleanupInfo.retentionDays.gps}日以上前</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">監査ログ</p>
                <p className="font-bold">{cleanupInfo.deletableRecords.audit}件</p>
                <p className="text-[10px] text-text-muted">{cleanupInfo.retentionDays.audit}日以上前</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">音声録音</p>
                <p className="font-bold">{cleanupInfo.deletableRecords.audio}件</p>
                <p className="text-[10px] text-text-muted">{cleanupInfo.retentionDays.audio}日以上前</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">期限切れセッション</p>
                <p className="font-bold">{cleanupInfo.deletableRecords.sessions ?? 0}件</p>
              </div>
            </div>
            {cleanupResult && (
              <div className="p-2 bg-success/10 border border-success/30 rounded-lg text-success text-xs mb-3">
                {cleanupResult}
              </div>
            )}
            <Button
              onClick={runCleanup}
              loading={cleaningUp}
              variant="danger"
              className="text-sm"
            >
              古いデータを削除
            </Button>
          </Card>
        )}

        {userRole === "admin" && healthInfo && (
          <Card>
            <h2 className="font-semibold mb-1">システム情報</h2>
            <p className="text-xs text-text-muted mb-4">データベースの状態とレコード数</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">DBサイズ</p>
                <p className="font-bold">{healthInfo.db.sizeMB} MB</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">ユーザー</p>
                <p className="font-bold">{healthInfo.counts.activeUsers}名</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">GPSポイント</p>
                <p className="font-bold">{healthInfo.counts.gpsPoints?.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">録音数</p>
                <p className="font-bold">{healthInfo.counts.recordings?.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">シフト総数</p>
                <p className="font-bold">{healthInfo.counts.shifts?.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">稼働中シフト</p>
                <p className="font-bold">{healthInfo.counts.activeShifts}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">セッション</p>
                <p className="font-bold">{healthInfo.counts.activeSessions}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted">稼働時間</p>
                <p className="font-bold">{Math.floor(healthInfo.uptime / 3600)}h {Math.floor((healthInfo.uptime % 3600) / 60)}m</p>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <h2 className="font-semibold mb-4">パスワード変更</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm text-text-muted mb-1">
                現在のパスワード
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.currentPassword}
                aria-describedby={errors.currentPassword ? "cur-pw-err" : undefined}
                {...register("currentPassword")}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.currentPassword && (
                <p id="cur-pw-err" className="mt-1 text-xs text-danger" role="alert">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm text-text-muted mb-1">
                新しいパスワード
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                aria-describedby={errors.newPassword ? "new-pw-err" : undefined}
                {...register("newPassword")}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.newPassword && (
                <p id="new-pw-err" className="mt-1 text-xs text-danger" role="alert">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-text-muted mb-1">
                新しいパスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirm-pw-err" : undefined}
                {...register("confirmPassword")}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.confirmPassword && (
                <p id="confirm-pw-err" className="mt-1 text-xs text-danger" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <div role="alert" className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
                {serverError}
              </div>
            )}
            {successMsg && (
              <div role="status" className="p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm">
                {successMsg}
              </div>
            )}

            <Button type="submit" loading={isSubmitting}>
              変更する
            </Button>
          </form>
        </Card>
      </Container>
    </div>
  );
}
