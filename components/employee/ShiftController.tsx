"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ShiftTimer } from "./ShiftTimer";
import { StatusIndicator } from "./StatusIndicator";

const GPS_INTERVAL_MS = 30_000;

interface ShiftState {
  id: string;
  startedAt: number;
}

export function ShiftController({ userName }: { userName: string }) {
  const [shift, setShift] = useState<ShiftState | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);
  const [error, setError] = useState("");

  const watchIdRef = useRef<number | null>(null);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const latestPositionRef = useRef<{ lat: number; lng: number; acc?: number } | null>(null);

  const sendGps = useCallback(
    async (shiftId: string) => {
      const pos = latestPositionRef.current;
      if (!pos) return;
      try {
        await fetch("/api/gps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shiftId,
            latitude: pos.lat,
            longitude: pos.lng,
            accuracy: pos.acc,
          }),
        });
      } catch {
        // silently ignore network errors
      }
    },
    []
  );

  const startGps = useCallback(
    (shiftId: string) => {
      if (!navigator.geolocation) return;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          latestPositionRef.current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            acc: position.coords.accuracy,
          };
          setGpsActive(true);
        },
        () => setGpsActive(false),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      // Send GPS immediately and then every 30s
      setTimeout(() => sendGps(shiftId), 2000);
      gpsIntervalRef.current = setInterval(
        () => sendGps(shiftId),
        GPS_INTERVAL_MS
      );
    },
    [sendGps]
  );

  const stopGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
    setGpsActive(false);
  }, []);

  const uploadChunk = useCallback(
    async (blob: Blob, shiftId: string) => {
      const formData = new FormData();
      formData.append("audio", blob);
      formData.append("shiftId", shiftId);
      try {
        await fetch("/api/audio", { method: "POST", body: formData });
      } catch {
        // silently ignore
      }
    },
    []
  );

  const startRecording = useCallback(
    async (shiftId: string) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/mp4";

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            uploadChunk(e.data, shiftId);
          }
        };

        // 5 minute chunks
        recorder.start(5 * 60 * 1000);
        setRecordingActive(true);
      } catch {
        setRecordingActive(false);
      }
    },
    [uploadChunk]
  );

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    setRecordingActive(false);
  }, []);

  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      // not supported or denied
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  const handleStartShift = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shifts/start", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error);
        return;
      }
      const newShift: ShiftState = {
        id: json.shift.id,
        startedAt: json.shift.startedAt,
      };
      setShift(newShift);
      startGps(newShift.id);
      startRecording(newShift.id);
      requestWakeLock();
    } catch {
      setError("勤務開始に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async () => {
    setLoading(true);
    setError("");
    try {
      // Send final GPS position
      if (shift) await sendGps(shift.id);
      stopGps();
      stopRecording();
      releaseWakeLock();

      const res = await fetch("/api/shifts/end", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error);
        return;
      }
      setShift(null);
    } catch {
      setError("勤務終了に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (shift) {
      await handleEndShift();
    }
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGps();
      stopRecording();
      releaseWakeLock();
    };
  }, [stopGps, stopRecording, releaseWakeLock]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-semibold">営業監視システム</h1>
          <p className="text-sm text-text-muted">{userName}</p>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          ログアウト
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {error && (
          <div className="w-full max-w-sm p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm text-center">
            {error}
          </div>
        )}

        {/* Timer */}
        {shift && (
          <Card className="w-full max-w-sm">
            <ShiftTimer startedAt={shift.startedAt} />
          </Card>
        )}

        {/* Status Indicators */}
        {shift && (
          <Card className="w-full max-w-sm">
            <div className="flex justify-around">
              <StatusIndicator active={gpsActive} label="GPS追跡中" />
              <StatusIndicator active={recordingActive} label="録音中" />
            </div>
          </Card>
        )}

        {/* Main Action Button */}
        <div className="w-full max-w-sm">
          {!shift ? (
            <Button
              onClick={handleStartShift}
              loading={loading}
              variant="success"
              className="w-full py-6 text-xl"
            >
              勤務開始
            </Button>
          ) : (
            <Button
              onClick={handleEndShift}
              loading={loading}
              variant="danger"
              className="w-full py-6 text-xl"
            >
              勤務終了
            </Button>
          )}
        </div>

        {!shift && (
          <p className="text-text-muted text-sm text-center">
            勤務開始するとGPS追跡と音声録音が自動的に開始されます
          </p>
        )}
      </div>
    </div>
  );
}
