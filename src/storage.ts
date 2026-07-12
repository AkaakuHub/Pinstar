import { CAMERA_STORAGE_KEY, COUNTDOWN_STORAGE_KEY } from "./config";
import type { CountdownSeconds, PersistedSettings } from "./types";

const read = (key: string): string => {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};

const write = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage may be disabled. The current session remains usable.
  }
};

const parseCountdown = (value: string): CountdownSeconds => {
  if (value === "5") return 5;
  if (value === "10") return 10;
  return 3;
};

export const loadSettings = (): PersistedSettings => ({
  cameraDeviceId: read(CAMERA_STORAGE_KEY),
  countdownSeconds: parseCountdown(read(COUNTDOWN_STORAGE_KEY)),
});

export const saveCameraDeviceId = (deviceId: string): void => {
  write(CAMERA_STORAGE_KEY, deviceId);
};

export const saveCountdownSeconds = (seconds: CountdownSeconds): void => {
  write(COUNTDOWN_STORAGE_KEY, String(seconds));
};
