import { EventEmitter } from "events";

declare const globalThis: {
  __eventBus?: EventEmitter;
};

export const eventBus: EventEmitter =
  globalThis.__eventBus ?? new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalThis.__eventBus = eventBus;
}

eventBus.setMaxListeners(100);

export type AppEvent =
  | { type: "gps_update"; userId: string; userName: string; latitude: number; longitude: number }
  | { type: "shift_start"; userId: string; userName: string }
  | { type: "shift_end"; userId: string; userName: string }
  | { type: "audio_upload"; userId: string; userName: string; recordingId: string };

export function emitEvent(event: AppEvent) {
  eventBus.emit("app_event", event);
}
