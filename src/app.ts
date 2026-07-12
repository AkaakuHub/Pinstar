import { UI_TICK_MS, VERSION, YOUTUBE_POLL_MS } from "./config";
import { CameraManager } from "./camera";
import { RecordingSession } from "./recorder";
import { loadSettings, saveCountdownSeconds } from "./storage";
import type { CountdownSeconds, LogEntry, LogLevel, RecorderState } from "./types";
import { describeError, formatTime, sleep } from "./utils";
import { createView, type View } from "./ui/view";
import { YouTubeController } from "./youtube";

export class PinstarApp {
  private readonly view: View = createView();
  private readonly youtube = new YouTubeController();
  private readonly camera = new CameraManager(this.view.camera);
  private readonly recorder = new RecordingSession();
  private readonly logs: LogEntry[] = [];
  private readonly cleanup: Array<() => void> = [];
  private readonly settings = loadSettings();

  private recorderState: RecorderState = "idle";
  private lastFile: File | null = null;
  private countdownToken = 0;
  private toastTimer = 0;
  private youtubePoll = 0;
  private uiTimer = 0;
  private destroyed = false;

  private readonly originalDocumentOverflow = document.documentElement.style.overflow;
  private readonly originalBodyOverflow = document.body?.style.overflow ?? "";

  start(): void {
    document.documentElement.style.overflow = "hidden";
    if (document.body) document.body.style.overflow = "hidden";

    this.view.countdownSelect.value = String(this.settings.countdownSeconds);
    this.syncViewport();
    this.bindEvents();
    this.refreshYouTube();
    this.renderPlayback();
    this.renderStatus();
    this.renderLogs();

    this.youtubePoll = window.setInterval(() => this.refreshYouTube(), YOUTUBE_POLL_MS);
    this.uiTimer = window.setInterval(() => {
      this.renderPlayback();
      this.renderRecordingTime();
    }, UI_TICK_MS);

    this.log("info", `Pinstar v${VERSION}を開始しました。`, location.href);
    if (!/^(www\.|m\.)?youtube\.com$/i.test(location.hostname)) {
      this.log("warn", "YouTube以外のページで実行されています。", location.hostname);
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    if (this.recorderState !== "idle") {
      this.showToast("録画を終了してから閉じてください");
      return;
    }
    this.destroyed = true;
    this.camera.stop();
    this.recorder.cancel();
    window.clearInterval(this.youtubePoll);
    window.clearInterval(this.uiTimer);
    window.clearTimeout(this.toastTimer);
    this.cleanup.splice(0).forEach((dispose) => dispose());
    document.documentElement.style.overflow = this.originalDocumentOverflow;
    if (document.body) document.body.style.overflow = this.originalBodyOverflow;
    this.view.host.remove();
  }

  private bindEvents(): void {
    this.bind(window, "resize", () => this.syncViewport());
    if (window.visualViewport) {
      this.bind(window.visualViewport, "resize", () => this.syncViewport());
      this.bind(window.visualViewport, "scroll", () => this.syncViewport());
    }

    this.bind(this.view.startCamera, "click", () => void this.startCamera(this.settings.cameraDeviceId || undefined));
    this.bind(this.view.switchCamera, "click", () => void this.switchCamera());
    this.bind(this.view.cameraSelect, "change", () => {
      if (this.view.cameraSelect.value) void this.startCamera(this.view.cameraSelect.value);
    });
    this.bind(this.view.closeButton, "click", () => this.destroy());
    this.bind(this.view.logsButton, "click", () => this.view.logModal.classList.remove("hidden"));
    this.bind(this.view.closeLogs, "click", () => this.view.logModal.classList.add("hidden"));
    this.bind(this.view.copyLogs, "click", () => void this.copyLogs());

    this.bind(this.view.back, "click", () => this.seekBy(-5));
    this.bind(this.view.forward, "click", () => this.seekBy(5));
    this.bind(this.view.play, "click", () => void this.togglePlayback());
    this.bind(this.view.seek, "input", () => {
      this.youtube.seekToFraction(Number(this.view.seek.value) / 1000);
    });

    this.cleanup.push(this.youtube.setupDoubleTap(this.view.tapLeft, -5, () => this.showToast("5秒戻る")));
    this.cleanup.push(this.youtube.setupDoubleTap(this.view.tapRight, 5, () => this.showToast("5秒進む")));

    this.bind(this.view.countdownSelect, "change", () => {
      const seconds = Number(this.view.countdownSelect.value) as CountdownSeconds;
      saveCountdownSeconds(seconds);
    });
    this.bind(this.view.recordButton, "click", () => void this.handleRecordButton());
    this.bind(this.view.shareButton, "click", () => void this.shareRecording());
  }

  private bind<T extends EventTarget>(
    target: T,
    event: string,
    listener: EventListenerOrEventListenerObject,
  ): void {
    target.addEventListener(event, listener);
    this.cleanup.push(() => target.removeEventListener(event, listener));
  }

  private syncViewport(): void {
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    Object.assign(this.view.host.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
  }

  private refreshYouTube(): void {
    const wasReady = Boolean(this.youtube.current);
    const video = this.youtube.refresh();
    if (!wasReady && video) this.log("info", "YouTubeのvideo要素を検出しました。");
    this.renderStatus();
  }

  private async startCamera(deviceId?: string): Promise<void> {
    if (this.recorderState !== "idle") {
      this.showToast("録画中はカメラを変更できません");
      return;
    }
    try {
      this.log("info", "カメラ権限を要求しています。");
      await this.camera.start(deviceId);
      await this.populateCameraSelect();
      this.view.centerCard.classList.add("hidden");
      this.log("info", "カメラを開始しました。", this.camera.currentDeviceId);
      this.showToast("カメラ開始");
    } catch (error) {
      this.log("error", "カメラを開始できませんでした。", error);
      this.showToast("カメラ開始失敗");
    }
    this.renderStatus();
  }

  private async populateCameraSelect(): Promise<void> {
    const devices = await this.camera.refreshDevices();
    this.view.cameraSelect.replaceChildren();
    if (devices.length === 0) {
      this.view.cameraSelect.append(new Option("カメラなし", ""));
      return;
    }
    devices.forEach((device, index) => {
      this.view.cameraSelect.append(new Option(device.label || `カメラ ${index + 1}`, device.deviceId));
    });
    this.view.cameraSelect.value = this.camera.currentDeviceId;
  }

  private async switchCamera(): Promise<void> {
    if (this.recorderState !== "idle") return;
    try {
      await this.camera.switchToNext();
      await this.populateCameraSelect();
      this.showToast("カメラ切替");
    } catch (error) {
      this.log("warn", "カメラを切り替えられませんでした。", error);
      this.showToast("カメラ切替失敗");
    }
  }

  private async togglePlayback(): Promise<void> {
    try {
      await this.youtube.togglePlayback();
    } catch (error) {
      this.log("error", "再生操作に失敗しました。", error);
      this.showToast("再生できません");
    }
  }

  private seekBy(seconds: number): void {
    try {
      this.youtube.seekBy(seconds);
      this.showToast(seconds < 0 ? "5秒戻る" : "5秒進む");
    } catch (error) {
      this.log("error", "シーク操作に失敗しました。", error);
      this.showToast("シークできません");
    }
  }

  private renderPlayback(): void {
    const video = this.youtube.current;
    if (!video) {
      this.view.play.textContent = "再生";
      this.view.seek.disabled = true;
      this.view.clock.textContent = "--:-- / --:--";
      return;
    }
    this.view.play.textContent = video.paused ? "再生" : "停止";
    const seekable = Number.isFinite(video.duration) && video.duration > 0;
    this.view.seek.disabled = !seekable;
    if (seekable && !this.view.seek.matches(":active")) {
      this.view.seek.value = String(Math.round((video.currentTime / video.duration) * 1000));
    }
    this.view.clock.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
  }

  private async handleRecordButton(): Promise<void> {
    if (this.recorderState === "recording") {
      await this.stopRecording();
      return;
    }
    if (this.recorderState === "countdown") {
      this.cancelCountdown();
      return;
    }
    if (this.recorderState === "encoding") return;
    await this.startCountdown();
  }

  private async startCountdown(): Promise<void> {
    if (!this.camera.ready || !this.youtube.current) {
      this.showToast("カメラとYouTubeを準備してください");
      return;
    }

    let audioTrack: MediaStreamTrack;
    try {
      audioTrack = this.youtube.captureAudioTrack();
    } catch (error) {
      this.log("error", "YouTube音声を取得できませんでした。", error);
      this.showToast("YouTube音声を取得できません", 2200);
      return;
    }

    const seconds = Number(this.view.countdownSelect.value) as CountdownSeconds;
    saveCountdownSeconds(seconds);
    this.recorderState = "countdown";
    this.view.recordButton.classList.add("countdown");
    this.view.countdownSelect.disabled = true;
    this.view.cameraSelect.disabled = true;
    this.view.switchCamera.disabled = true;
    this.view.countdownOverlay.classList.remove("hidden");
    this.renderStatus();

    const token = ++this.countdownToken;
    try {
      for (let remaining = seconds; remaining > 0; remaining -= 1) {
        if (token !== this.countdownToken) {
          audioTrack.stop();
          return;
        }
        this.view.countdownNumber.textContent = String(remaining);
        await sleep(1000);
      }
      if (token !== this.countdownToken) {
        audioTrack.stop();
        return;
      }

      const videoTrack = this.camera.cloneVideoTrack();
      this.recorder.start(videoTrack, audioTrack);
      this.recorderState = "recording";
      this.view.recordButton.classList.remove("countdown");
      this.view.recordButton.classList.add("recording");
      this.view.recordButton.setAttribute("aria-label", "録画終了");
      this.view.recordTime.classList.add("visible");
      this.view.countdownOverlay.classList.add("hidden");
      this.lastFile = null;
      this.view.shareButton.disabled = true;
      this.log("info", "録画を開始しました。音声入力はYouTubeのcaptureStreamです。");
      this.showToast("録画開始");
    } catch (error) {
      audioTrack.stop();
      this.log("error", "録画を開始できませんでした。", error);
      this.showToast("録画開始失敗", 2000);
      this.resetRecorderUi();
    }
    this.renderStatus();
  }

  private cancelCountdown(): void {
    this.countdownToken += 1;
    this.recorderState = "idle";
    this.view.countdownOverlay.classList.add("hidden");
    this.resetRecorderUi();
    this.renderStatus();
    this.showToast("録画をキャンセルしました");
  }

  private async stopRecording(): Promise<void> {
    this.recorderState = "encoding";
    this.view.recordButton.disabled = true;
    this.view.recordButton.classList.remove("recording");
    this.view.recordButton.setAttribute("aria-label", "エンコード中");
    this.renderStatus();
    this.showToast("エンコード中…", 1800);

    try {
      const result = await this.recorder.stop();
      this.lastFile = result.file;
      this.view.shareButton.disabled = false;
      this.log(
        "info",
        "MP4の生成が完了しました。",
        `${(result.file.size / 1024 / 1024).toFixed(1)} MB / ${formatTime(result.durationSeconds)}`,
      );
      this.showToast("録画を共有できます", 1800);
    } catch (error) {
      this.log("error", "録画を終了できませんでした。", error);
      this.showToast("録画終了失敗", 1800);
    } finally {
      this.recorderState = "idle";
      this.resetRecorderUi();
      this.renderStatus();
    }
  }

  private resetRecorderUi(): void {
    this.view.recordButton.disabled = false;
    this.view.recordButton.classList.remove("recording", "countdown");
    this.view.recordButton.setAttribute("aria-label", "録画開始");
    this.view.recordTime.classList.remove("visible");
    this.view.recordTime.textContent = "00:00";
    this.view.countdownSelect.disabled = false;
    this.view.cameraSelect.disabled = false;
    this.view.switchCamera.disabled = false;
  }

  private renderRecordingTime(): void {
    if (this.recorderState !== "recording") return;
    this.view.recordTime.textContent = formatTime(this.recorder.elapsedSeconds);
  }

  private async shareRecording(): Promise<void> {
    const file = this.lastFile;
    if (!file) {
      this.showToast("共有する録画がありません");
      return;
    }
    if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
      this.log("error", "このSafariではMP4ファイル共有を使用できません。");
      this.showToast("ファイル共有非対応");
      return;
    }
    try {
      await navigator.share({ files: [file], title: "Pinstar録画" });
      this.log("info", "共有シートへ録画を渡しました。", file.name);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      this.log("error", "録画を共有できませんでした。", error);
      this.showToast("共有失敗");
    }
  }

  private renderStatus(): void {
    this.view.statusDot.className = "";
    const youtubeReady = Boolean(this.youtube.current);
    if (this.logs.some((entry) => entry.level === "error")) this.view.statusDot.classList.add("error");
    else if (youtubeReady && this.camera.ready) this.view.statusDot.classList.add("ready");

    if (this.recorderState === "recording") this.view.statusText.textContent = "録画中";
    else if (this.recorderState === "countdown") this.view.statusText.textContent = "待機中";
    else if (this.recorderState === "encoding") this.view.statusText.textContent = "処理中";
    else if (!youtubeReady) this.view.statusText.textContent = "YouTube待機";
    else if (!this.camera.ready) this.view.statusText.textContent = "カメラ待機";
    else this.view.statusText.textContent = "準備完了";
  }

  private log(level: LogLevel, message: string, detail?: unknown): void {
    this.logs.push({
      at: new Date().toLocaleTimeString("ja-JP", { hour12: false }),
      level,
      message,
      detail: detail === undefined ? undefined : describeError(detail),
    });
    if (this.logs.length > 100) this.logs.shift();
    this.renderLogs();
    this.renderStatus();
    console[level === "error" ? "error" : level === "warn" ? "warn" : "info"](
      `[Pinstar] ${message}`,
      detail ?? "",
    );
  }

  private renderLogs(): void {
    this.view.logList.replaceChildren();
    if (this.logs.length === 0) {
      this.view.logList.textContent = "ログはありません。";
      return;
    }
    for (const entry of this.logs) {
      const row = document.createElement("div");
      row.className = `log-row ${entry.level}`;
      row.textContent = `[${entry.at}] ${entry.message}${entry.detail ? `\n${entry.detail}` : ""}`;
      this.view.logList.append(row);
    }
  }

  private async copyLogs(): Promise<void> {
    const text = this.logs
      .map((entry) => `[${entry.at}] ${entry.level.toUpperCase()} ${entry.message}${entry.detail ? `\n${entry.detail}` : ""}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      this.showToast("ログをコピーしました");
    } catch (error) {
      this.log("warn", "ログをコピーできませんでした。", error);
    }
  }

  private showToast(message: string, duration = 1300): void {
    window.clearTimeout(this.toastTimer);
    this.view.toast.textContent = message;
    this.view.toast.classList.add("show");
    this.toastTimer = window.setTimeout(() => this.view.toast.classList.remove("show"), duration);
  }
}
