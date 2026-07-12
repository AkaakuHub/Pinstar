import { UI_TICK_MS, VERSION, YOUTUBE_POLL_MS } from "./config";
import { CameraManager } from "./camera";
import { loadSettings } from "./storage";
import type { LogEntry, LogLevel } from "./types";
import { describeError, formatTime } from "./utils";
import { createView, type View } from "./ui/view";
import { YouTubeController } from "./youtube";

export class PinstarApp {
  private readonly view: View = createView();
  private readonly youtube = new YouTubeController();
  private readonly camera = new CameraManager(this.view.camera);
  private readonly logs: LogEntry[] = [];
  private readonly cleanup: Array<() => void> = [];
  private readonly settings = loadSettings();

  private toastTimer = 0;
  private youtubePoll = 0;
  private uiTimer = 0;
  private destroyed = false;

  private readonly originalDocumentOverflow = document.documentElement.style.overflow;
  private readonly originalBodyOverflow = document.body?.style.overflow ?? "";

  start(): void {
    document.documentElement.style.overflow = "hidden";
    if (document.body) document.body.style.overflow = "hidden";

    this.syncViewport();
    this.bindEvents();
    this.refreshYouTube();
    this.renderPlayback();
    this.renderStatus();
    this.renderLogs();

    this.youtubePoll = window.setInterval(() => this.refreshYouTube(), YOUTUBE_POLL_MS);
    this.uiTimer = window.setInterval(() => this.renderPlayback(), UI_TICK_MS);

    this.log("info", `Pinstar v${VERSION}を開始しました。`, location.href);
    if (!/^(www\.|m\.)?youtube\.com$/i.test(location.hostname)) {
      this.log("warn", "YouTube以外のページで実行されています。", location.hostname);
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.camera.stop();
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

    this.cleanup.push(this.youtube.setupTapGestures(
      this.view.tapLeft,
      -5,
      () => this.toggleUi(),
      () => this.showToast("5秒戻る"),
    ));
    this.cleanup.push(this.youtube.setupTapGestures(
      this.view.tapRight,
      5,
      () => this.toggleUi(),
      () => this.showToast("5秒進む"),
    ));
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

  private toggleUi(): void {
    this.view.app.classList.toggle("ui-hidden");
  }

  private renderStatus(): void {
    this.view.statusDot.className = "";
    const youtubeReady = Boolean(this.youtube.current);
    if (this.logs.some((entry) => entry.level === "error")) this.view.statusDot.classList.add("error");
    else if (youtubeReady && this.camera.ready) this.view.statusDot.classList.add("ready");

    if (!youtubeReady) this.view.statusText.textContent = "YouTube待機";
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
