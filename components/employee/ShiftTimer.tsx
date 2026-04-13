"use client";

import { useState, useEffect } from "react";

export function ShiftTimer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    function update() {
      const diff = Date.now() - startedAt;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <div className="text-center">
      <div className="text-5xl font-mono font-bold tracking-wider text-primary">
        {elapsed}
      </div>
      <p className="text-text-muted mt-2 text-sm">勤務時間</p>
    </div>
  );
}
