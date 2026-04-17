"use client";

interface TrendPoint {
  date: string;
  workedMs: number;
  shifts: number;
}

function formatHours(ms: number): string {
  const h = ms / 3600000;
  return h >= 1 ? `${h.toFixed(1)}h` : `${Math.round(ms / 60000)}m`;
}

function weekdayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const wd = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getDate()}(${wd})`;
}

export function TrendChart({ trend }: { trend: TrendPoint[] }) {
  if (trend.length === 0) return null;

  const maxMs = Math.max(...trend.map((t) => t.workedMs), 1);
  const workedDays = trend.filter((t) => t.workedMs > 0);
  const avgMs = workedDays.length > 0
    ? workedDays.reduce((s, t) => s + t.workedMs, 0) / workedDays.length
    : 0;
  const avgPct = maxMs > 0 ? (avgMs / maxMs) * 100 : 0;

  return (
    <div className="bg-surface rounded-xl border border-white/10 p-4 col-span-full" role="img" aria-label="過去7日間の勤務時間チャート">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-muted">
          過去7日間の勤務時間
        </h3>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>平均: {formatHours(avgMs)}</span>
          <span>ピーク: {formatHours(maxMs)}</span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-24 relative">
        {avgMs > 0 && (
          <div
            className="absolute left-0 right-0 border-t border-dashed border-text-muted/30 pointer-events-none"
            style={{ bottom: `${avgPct}%` }}
          />
        )}
        {trend.map((point) => {
          const heightPct = maxMs > 0 ? (point.workedMs / maxMs) * 100 : 0;
          const isToday = point.date === new Date().toISOString().slice(0, 10);
          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              <div className="w-full h-full flex items-end">
                <div
                  className={`w-full rounded-t transition-all ${
                    isToday
                      ? "bg-primary"
                      : point.workedMs > 0
                        ? "bg-primary/50"
                        : "bg-white/10"
                  }`}
                  style={{ height: `${heightPct}%`, minHeight: "2px" }}
                />
              </div>
              <div className="text-[10px] text-text-muted whitespace-nowrap">
                {weekdayLabel(point.date)}
              </div>
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-surface-light border border-white/10 rounded px-2 py-1 text-xs whitespace-nowrap pointer-events-none z-10">
                {formatHours(point.workedMs)} ({point.shifts}シフト)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
