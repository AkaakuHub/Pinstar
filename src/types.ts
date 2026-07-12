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

export type PersistedSettings = {
  cameraDeviceId: string;
};
