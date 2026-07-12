export type LogLevel = "info" | "warn" | "error";

export type LogEntry = {
  at: string;
  level: LogLevel;
  message: string;
  detail?: string;
};

export type RuntimeHandle = {
  version: string;
  destroy: () => void;
};

export type CountdownSeconds = 3 | 5 | 10;

export type PersistedSettings = {
  cameraDeviceId: string;
  countdownSeconds: CountdownSeconds;
};

export type RecorderState = "idle" | "countdown" | "recording" | "encoding";
