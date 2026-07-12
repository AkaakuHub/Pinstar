import { RECORDING_MIME } from "./config";

export type RecordingResult = {
  file: File;
  durationSeconds: number;
};

export class RecordingSession {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startedAt = 0;

  get active(): boolean {
    return this.recorder?.state === "recording";
  }

  get elapsedSeconds(): number {
    return this.active ? (performance.now() - this.startedAt) / 1000 : 0;
  }

  start(videoTrack: MediaStreamTrack, audioTrack: MediaStreamTrack): void {
    if (this.active) throw new Error("すでに録画中です。");
    if (!window.MediaRecorder) throw new Error("MediaRecorder APIを使用できません。");
    if (MediaRecorder.isTypeSupported && !MediaRecorder.isTypeSupported(RECORDING_MIME)) {
      throw new Error(`このSafariは${RECORDING_MIME}の録画に対応していません。`);
    }

    this.stream = new MediaStream([videoTrack, audioTrack]);
    this.chunks = [];
    this.recorder = new MediaRecorder(this.stream, { mimeType: RECORDING_MIME });
    this.recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    });
    this.recorder.start(1000);
    this.startedAt = performance.now();
  }

  async stop(): Promise<RecordingResult> {
    const recorder = this.recorder;
    if (!recorder || recorder.state !== "recording") {
      throw new Error("録画は開始されていません。");
    }

    const durationSeconds = (performance.now() - this.startedAt) / 1000;
    await new Promise<void>((resolve, reject) => {
      recorder.addEventListener("stop", () => resolve(), { once: true });
      recorder.addEventListener(
        "error",
        (event) => {
          const error = "error" in event
            ? (event as Event & { error?: DOMException }).error
            : undefined;
          reject(error ?? new Error("MediaRecorderでエラーが発生しました。"));
        },
        { once: true },
      );
      recorder.stop();
    });

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.recorder = null;

    if (this.chunks.length === 0) throw new Error("録画データが生成されませんでした。");
    const blob = new Blob(this.chunks, { type: RECORDING_MIME });
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
    const file = new File([blob], `Pinstar-${stamp}.mp4`, { type: RECORDING_MIME });
    return { file, durationSeconds };
  }

  cancel(): void {
    if (this.recorder?.state === "recording") this.recorder.stop();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
  }
}
