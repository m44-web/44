"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { useRealtime } from "./RealtimeProvider";
import { relativeTime } from "@/lib/time";

interface Recording {
  id: string;
  userId: string;
  userName: string;
  durationSec: number | null;
  recordedAt: number;
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("ja-JP");
}

export function AudioPanel() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const { lastEvent } = useRealtime();

  const fetchRecordings = useCallback(async () => {
    try {
      const res = await fetch("/api/audio");
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.recordings);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  useEffect(() => {
    if (lastEvent?.type === "audio_upload") {
      fetchRecordings();
    }
  }, [lastEvent, fetchRecordings]);

  const handlePlay = (id: string) => {
    setPlaying(playing === id ? null : id);
  };

  return (
    <Card>
      <h2 className="font-semibold mb-4">録音一覧</h2>

      {recordings.length === 0 ? (
        <p className="text-text-muted text-sm">録音はまだありません</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              className="p-3 bg-white/5 rounded-lg border border-white/5"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{rec.userName}</p>
                  <p className="text-xs text-text-muted" title={formatDateTime(rec.recordedAt)}>
                    {relativeTime(rec.recordedAt)}
                  </p>
                </div>
                <button
                  onClick={() => handlePlay(rec.id)}
                  className="px-3 py-1.5 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
                >
                  {playing === rec.id ? "閉じる" : "再生"}
                </button>
              </div>
              {playing === rec.id && (
                <audio
                  controls
                  autoPlay
                  className="w-full mt-2"
                  src={`/api/audio/${rec.id}`}
                  onEnded={() => setPlaying(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
