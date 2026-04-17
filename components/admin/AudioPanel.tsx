"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const PLAYBACK_SPEEDS = [1, 1.5, 2];

export function AudioPanel() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [filterUser, setFilterUser] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed, playing]);

  const handlePlay = (id: string) => {
    setPlaying(playing === id ? null : id);
  };

  const cycleSpeed = () => {
    const idx = PLAYBACK_SPEEDS.indexOf(speed);
    setSpeed(PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length]);
  };

  const uniqueUsers = Array.from(new Set(recordings.map((r) => r.userName))).sort();
  const filtered = filterUser
    ? recordings.filter((r) => r.userName === filterUser)
    : recordings;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 gap-2">
        <h2 className="font-semibold">録音一覧</h2>
        <span className="text-xs text-text-muted">{filtered.length}件</span>
      </div>

      {uniqueUsers.length > 1 && (
        <div className="mb-3">
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="text-xs bg-surface-light border border-white/10 rounded px-2 py-1 text-text-muted w-full"
          >
            <option value="">全従業員</option>
            {uniqueUsers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-text-muted text-sm">録音はまだありません</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className={`p-3 rounded-lg border transition-colors ${
                playing === rec.id
                  ? "bg-primary/10 border-primary/30"
                  : "bg-white/5 border-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{rec.userName}</p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span title={formatDateTime(rec.recordedAt)}>
                      {relativeTime(rec.recordedAt)}
                    </span>
                    {rec.durationSec && (
                      <span className="font-mono">
                        {formatDuration(rec.durationSec)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {playing === rec.id && (
                    <button
                      onClick={cycleSpeed}
                      className="px-1.5 py-1 text-[10px] font-mono bg-white/10 rounded text-text-muted hover:bg-white/20"
                      title="再生速度"
                    >
                      {speed}x
                    </button>
                  )}
                  <button
                    onClick={() => handlePlay(rec.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      playing === rec.id
                        ? "bg-danger/20 hover:bg-danger/30 text-danger"
                        : "bg-primary/20 hover:bg-primary/30 text-primary"
                    }`}
                  >
                    {playing === rec.id ? "■ 停止" : "▶ 再生"}
                  </button>
                </div>
              </div>
              {playing === rec.id && (
                <audio
                  ref={audioRef}
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
