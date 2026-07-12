import { CAMERA_STORAGE_KEY } from "./config";
import type { PersistedSettings } from "./types";

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

export const loadSettings = (): PersistedSettings => ({
  cameraDeviceId: read(CAMERA_STORAGE_KEY),
});

export const saveCameraDeviceId = (deviceId: string): void => {
  write(CAMERA_STORAGE_KEY, deviceId);
};
