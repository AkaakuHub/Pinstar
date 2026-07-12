const VERSION = "0.2.0";
const ROOT_ID = "pinstar-root";
const CAMERA_STORAGE_KEY = "pinstar.camera.deviceId";
const COUNTDOWN_STORAGE_KEY = "pinstar.record.countdown";
const RECORDING_MIME = "video/mp4";

type LogLevel = "info" | "warn" | "error";
type LogEntry = { at: string; level: LogLevel; message: string; detail?: string };
type RuntimeHandle = { version: string; destroy: () => void };
type AudioBridge = {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
  destination: MediaStreamAudioDestinationNode;
  analyser: AnalyserNode;
};

declare global {
  interface Window {
    __PINSTAR__?: RuntimeHandle;
    __PINSTAR_AUDIO_BRIDGES__?: WeakMap<HTMLMediaElement, AudioBridge>;
    webkitAudioContext?: typeof AudioContext;
  }
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
};

const describeError = (error: unknown): string => {
  if (error instanceof DOMException) return `${error.name}: ${error.message}`;
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
};

const storageGet = (key: string): string => {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};

const storageSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // YouTube側でストレージが無効な場合は、現在のセッションだけで動作させる。
  }
};

const css = String.raw`
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; }
  button, select, input { font: inherit; }
  button, select { -webkit-tap-highlight-color: transparent; }
  #app {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    color: #f8fafc;
    background: #020617;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
  }
  #camera {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #000;
  }
  #record-canvas { display: none; }
  #shade {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(2,6,23,.68) 0, transparent 23%, transparent 69%, rgba(2,6,23,.84) 100%);
  }
  #tap-layer {
    position: absolute;
    z-index: 2;
    top: 54px;
    bottom: 90px;
    left: 0;
    right: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    pointer-events: auto;
    touch-action: manipulation;
  }
  .tap-zone {
    min-width: 0;
    min-height: 0;
    background: transparent;
    color: transparent;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  #topbar {
    position: absolute;
    z-index: 4;
    top: max(7px, env(safe-area-inset-top));
    left: max(8px, env(safe-area-inset-left));
    right: max(8px, env(safe-area-inset-right));
    display: grid;
    grid-template-columns: auto minmax(86px, 1fr) auto auto auto;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    height: 38px;
    padding: 0 10px;
    border: 1px solid rgba(255,255,255,.17);
    border-radius: 13px;
    background: rgba(2,6,23,.76);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    font-size: 12px;
    font-weight: 750;
    white-space: nowrap;
  }
  #status-dot { width: 8px; height: 8px; flex: 0 0 auto; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.17); }
  #status-dot.ok { background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,.17); }
  #status-dot.error { background: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.17); }
  #status-text { max-width: 18vw; overflow: hidden; text-overflow: ellipsis; }
  #camera-select, #countdown-select {
    min-width: 0;
    height: 38px;
    padding: 0 28px 0 10px;
    color: #f8fafc;
    border: 1px solid rgba(255,255,255,.17);
    border-radius: 12px;
    background: rgba(2,6,23,.76);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .icon-button, .action-button {
    height: 38px;
    border: 1px solid rgba(255,255,255,.17);
    border-radius: 12px;
    color: #f8fafc;
    background: rgba(2,6,23,.76);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    font-size: 13px;
    font-weight: 750;
    box-shadow: 0 8px 28px rgba(0,0,0,.18);
  }
  .icon-button { width: 38px; padding: 0; font-size: 18px; }
  .action-button { min-width: 42px; padding: 0 10px; }
  .icon-button:disabled, .action-button:disabled, select:disabled { opacity: .42; }
  .icon-button:active, .action-button:active { transform: scale(.97); }
  #center-card {
    position: absolute;
    z-index: 5;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(340px, calc(100% - 32px));
    padding: 18px;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 20px;
    background: rgba(2,6,23,.88);
    box-shadow: 0 24px 80px rgba(0,0,0,.45);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    text-align: center;
  }
  #center-card.hidden { display: none; }
  #center-card h1 { margin: 0 0 7px; font-size: 19px; }
  #center-card p { margin: 0 0 14px; color: #cbd5e1; font-size: 12px; line-height: 1.55; }
  .primary {
    width: 100%;
    min-height: 44px;
    border: 0;
    border-radius: 13px;
    color: white;
    background: #2563eb;
    font-weight: 800;
    font-size: 14px;
  }
  #controls {
    position: absolute;
    z-index: 4;
    left: max(8px, env(safe-area-inset-left));
    right: max(8px, env(safe-area-inset-right));
    bottom: max(7px, env(safe-area-inset-bottom));
    display: grid;
    grid-template-columns: auto auto auto minmax(72px, 1fr) auto auto auto auto auto auto;
    gap: 6px;
    align-items: center;
    min-width: 0;
    padding: 7px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 15px;
    background: rgba(2,6,23,.78);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
  #play { min-width: 52px; background: rgba(37,99,235,.96); }
  #record { background: rgba(220,38,38,.96); border-color: rgba(248,113,113,.72); }
  #record.recording { animation: pulse 1s infinite; }
  @keyframes pulse { 50% { opacity: .62; } }
  #seek { width: 100%; min-width: 0; accent-color: #60a5fa; }
  #clock, #rec-clock {
    min-width: 78px;
    color: #dbeafe;
    font-variant-numeric: tabular-nums;
    font-size: 11px;
    text-align: center;
    white-space: nowrap;
  }
  #rec-clock { min-width: 58px; color: #fecaca; }
  #countdown-select { width: 74px; padding-left: 8px; }
  #toast {
    position: absolute;
    z-index: 8;
    left: 50%;
    top: 17%;
    transform: translate(-50%, -8px);
    opacity: 0;
    max-width: min(82%, 520px);
    padding: 9px 13px;
    border-radius: 12px;
    color: white;
    background: rgba(15,23,42,.94);
    font-size: 13px;
    font-weight: 750;
    text-align: center;
    transition: .16s ease;
    pointer-events: none;
  }
  #toast.show { opacity: 1; transform: translate(-50%, 0); }
  #countdown-overlay {
    position: absolute;
    z-index: 9;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(2,6,23,.34);
    pointer-events: none;
  }
  #countdown-overlay.hidden { display: none; }
  #countdown-number {
    min-width: 110px;
    padding: 16px 24px;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 24px;
    background: rgba(2,6,23,.78);
    color: #fff;
    font-size: clamp(54px, 18vw, 110px);
    font-weight: 850;
    line-height: 1;
    text-align: center;
    font-variant-numeric: tabular-nums;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .modal {
    position: absolute;
    z-index: 10;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(2,6,23,.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .modal.hidden { display: none; }
  .panel {
    width: min(520px, 94%);
    max-height: min(78%, 430px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 18px;
    background: #0f172a;
    box-shadow: 0 30px 90px rgba(0,0,0,.5);
  }
  .panel-head { display: flex; align-items: center; gap: 8px; padding: 11px; border-bottom: 1px solid rgba(255,255,255,.1); }
  .panel-head strong { flex: 1; font-size: 14px; }
  #log-list { max-height: 300px; overflow: auto; padding: 9px 11px 15px; -webkit-overflow-scrolling: touch; }
  .log-row { padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,.08); font-size: 11px; line-height: 1.45; }
  .log-row.error { color: #fecaca; }
  .log-row.warn { color: #fde68a; }
  .log-time { color: #94a3b8; margin-right: 7px; }
  @media (orientation: portrait) {
    #topbar { grid-template-columns: auto minmax(70px, 1fr) auto auto auto; }
    #status-text { display: none; }
    #controls {
      grid-template-columns: 42px 54px 42px minmax(62px, 1fr) 70px;
      grid-template-areas:
        "back play forward seek clock"
        "record record countdown stop share";
      padding: 6px;
    }
    #back { grid-area: back; }
    #play { grid-area: play; }
    #forward { grid-area: forward; }
    #seek { grid-area: seek; }
    #clock { grid-area: clock; min-width: 0; }
    #record { grid-area: record; }
    #countdown-select { grid-area: countdown; width: 100%; }
    #stop { grid-area: stop; }
    #share { grid-area: share; }
    #rec-clock { display: none; }
    #tap-layer { bottom: 124px; }
  }
  @media (max-width: 430px) {
    .brand { padding: 0 8px; }
    #camera-select { padding-left: 8px; }
    .icon-button { width: 36px; }
    #topbar { gap: 4px; }
    #controls { gap: 4px; }
    .action-button { padding: 0 7px; }
  }
  @media (max-height: 390px) and (orientation: landscape) {
    #topbar { top: max(4px, env(safe-area-inset-top)); }
    #controls { bottom: max(4px, env(safe-area-inset-bottom)); padding: 5px; }
    .brand, #camera-select, #countdown-select, .icon-button, .action-button { height: 34px; }
    #tap-layer { top: 46px; bottom: 72px; }
  }
`;

const markup = `
  <div id="app">
    <video id="camera" autoplay muted playsinline></video>
    <canvas id="record-canvas"></canvas>
    <div id="shade"></div>
    <div id="tap-layer" aria-label="左右をダブルタップして5秒移動">
      <div class="tap-zone" id="tap-left"></div>
      <div class="tap-zone" id="tap-right"></div>
    </div>

    <div id="topbar">
      <div class="brand"><span id="status-dot"></span><span>Pinstar</span><span id="status-text">初期化中</span></div>
      <select id="camera-select" aria-label="カメラ入力"><option value="">カメラ</option></select>
      <button class="icon-button" id="switch-camera" aria-label="カメラ切替">↻</button>
      <button class="icon-button" id="logs" aria-label="動作ログ">≡</button>
      <button class="icon-button" id="close" aria-label="閉じる">×</button>
    </div>

    <div id="center-card">
      <h1>カメラを開始</h1>
      <p>録画映像にはカメラだけを入れます。音声はYouTubeのvideo要素からWeb Audioで取得し、マイクは使用しません。</p>
      <button class="primary" id="start-camera">カメラを許可して開始</button>
    </div>

    <div id="toast"></div>
    <div id="countdown-overlay" class="hidden"><div id="countdown-number">3</div></div>

    <div id="controls">
      <button class="action-button" id="back">−5</button>
      <button class="action-button" id="play">再生</button>
      <button class="action-button" id="forward">+5</button>
      <input id="seek" type="range" min="0" max="1000" value="0" step="1" aria-label="再生位置">
      <span id="clock">--:-- / --:--</span>
      <button class="action-button" id="record">録画</button>
      <select id="countdown-select" aria-label="録画開始カウントダウン">
        <option value="3">3秒</option>
        <option value="5">5秒</option>
        <option value="10">10秒</option>
      </select>
      <button class="action-button" id="stop" disabled>停止</button>
      <button class="action-button" id="share" disabled>共有</button>
      <span id="rec-clock">REC 00:00</span>
    </div>

    <div class="modal hidden" id="log-modal">
      <div class="panel">
        <div class="panel-head"><strong>動作ログ</strong><button class="action-button" id="copy-logs">コピー</button><button class="action-button" id="close-logs">閉じる</button></div>
        <div id="log-list"></div>
      </div>
    </div>
  </div>
`;

const start = (): RuntimeHandle => {
  window.__PINSTAR__?.destroy();
  document.getElementById(ROOT_ID)?.remove();

  const host = document.createElement("div");
  host.id = ROOT_ID;
  Object.assign(host.style, {
    position: "fixed",
    zIndex: "2147483647",
    margin: "0",
    padding: "0",
    overflow: "hidden",
    pointerEvents: "auto",
  });

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = css;
  shadow.append(style);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = markup;
  shadow.append(...Array.from(wrapper.childNodes));
  document.documentElement.append(host);

  const byId = <T extends HTMLElement>(id: string): T => {
    const node = shadow.getElementById(id);
    if (!node) throw new Error(`UI element not found: ${id}`);
    return node as T;
  };

  const camera = byId<HTMLVideoElement>("camera");
  const recordCanvas = byId<HTMLCanvasElement>("record-canvas");
  const cameraSelect = byId<HTMLSelectElement>("camera-select");
  const countdownSelect = byId<HTMLSelectElement>("countdown-select");
  const centerCard = byId<HTMLDivElement>("center-card");
  const seek = byId<HTMLInputElement>("seek");
  const playButton = byId<HTMLButtonElement>("play");
  const recordButton = byId<HTMLButtonElement>("record");
  const stopButton = byId<HTMLButtonElement>("stop");
  const shareButton = byId<HTMLButtonElement>("share");
  const closeButton = byId<HTMLButtonElement>("close");
  const clock = byId<HTMLSpanElement>("clock");
  const recClock = byId<HTMLSpanElement>("rec-clock");
  const statusDot = byId<HTMLSpanElement>("status-dot");
  const statusText = byId<HTMLSpanElement>("status-text");
  const toast = byId<HTMLDivElement>("toast");
  const countdownOverlay = byId<HTMLDivElement>("countdown-overlay");
  const countdownNumber = byId<HTMLDivElement>("countdown-number");
  const logModal = byId<HTMLDivElement>("log-modal");
  const logList = byId<HTMLDivElement>("log-list");
  const logs: LogEntry[] = [];
  const cleanup: Array<() => void> = [];

  const originalDocumentOverflow = document.documentElement.style.overflow;
  const originalBodyOverflow = document.body?.style.overflow ?? "";
  document.documentElement.style.overflow = "hidden";
  if (document.body) document.body.style.overflow = "hidden";

  let cameraStream: MediaStream | null = null;
  let youtubeVideo: HTMLVideoElement | null = null;
  let cameraDevices: MediaDeviceInfo[] = [];
  let selectedDeviceId = storageGet(CAMERA_STORAGE_KEY);
  let toastTimer = 0;
  let videoPoll = 0;
  let updateTimer = 0;
  let recordingTimer = 0;
  let drawFrame = 0;
  let countdownToken = 0;
  let destroyed = false;
  let cameraReady = false;
  let youtubeReady = false;
  let recording = false;
  let countdownRunning = false;
  let mediaRecorder: MediaRecorder | null = null;
  let recordingStream: MediaStream | null = null;
  let recordedChunks: Blob[] = [];
  let recordingStartedAt = 0;
  let lastFile: File | null = null;
  let activeAudioBridge: AudioBridge | null = null;
  let activeAudioVideo: HTMLVideoElement | null = null;

  const savedCountdown = storageGet(COUNTDOWN_STORAGE_KEY);
  if (["3", "5", "10"].includes(savedCountdown)) countdownSelect.value = savedCountdown;

  const syncViewport = (): void => {
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    host.style.left = `${left}px`;
    host.style.top = `${top}px`;
    host.style.width = `${width}px`;
    host.style.height = `${height}px`;
  };
  syncViewport();
  window.visualViewport?.addEventListener("resize", syncViewport);
  window.visualViewport?.addEventListener("scroll", syncViewport);
  window.addEventListener("resize", syncViewport);
  cleanup.push(() => window.visualViewport?.removeEventListener("resize", syncViewport));
  cleanup.push(() => window.visualViewport?.removeEventListener("scroll", syncViewport));
  cleanup.push(() => window.removeEventListener("resize", syncViewport));

  const renderStatus = (): void => {
    statusDot.className = "";
    if (logs.some((entry) => entry.level === "error")) statusDot.classList.add("error");
    else if (cameraReady && youtubeReady) statusDot.classList.add("ok");

    if (recording) statusText.textContent = "録画中";
    else if (countdownRunning) statusText.textContent = "待機中";
    else if (!youtubeReady) statusText.textContent = "YouTube待機";
    else if (!cameraReady) statusText.textContent = "カメラ待機";
    else statusText.textContent = "準備完了";
  };

  const renderLogs = (): void => {
    if (logs.length === 0) {
      logList.textContent = "ログはありません。";
      return;
    }
    logList.replaceChildren(...logs.map((entry) => {
      const row = document.createElement("div");
      row.className = `log-row ${entry.level}`;
      const time = document.createElement("span");
      time.className = "log-time";
      time.textContent = entry.at;
      row.append(time, document.createTextNode(entry.message));
      if (entry.detail) row.append(document.createElement("br"), document.createTextNode(entry.detail));
      return row;
    }));
  };

  const log = (level: LogLevel, message: string, detail?: unknown): void => {
    const entry: LogEntry = {
      at: new Date().toLocaleTimeString("ja-JP", { hour12: false }),
      level,
      message,
      detail: detail === undefined ? undefined : describeError(detail),
    };
    logs.push(entry);
    if (logs.length > 100) logs.shift();
    renderLogs();
    renderStatus();
    console[level === "error" ? "error" : level === "warn" ? "warn" : "info"](`[Pinstar] ${message}`, detail ?? "");
  };

  const showToast = (message: string, duration = 1300): void => {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), duration);
  };

  const bind = <K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    event: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void => {
    target.addEventListener(event, listener as EventListener, options);
    cleanup.push(() => target.removeEventListener(event, listener as EventListener, options));
  };

  const locateYouTubeVideo = (): HTMLVideoElement | null =>
    document.querySelector<HTMLVideoElement>("video.html5-main-video") ??
    document.querySelector<HTMLVideoElement>("#movie_player video") ??
    document.querySelector<HTMLVideoElement>("ytm-player video") ??
    document.querySelector<HTMLVideoElement>("video");

  const attachYouTubeVideo = (candidate: HTMLVideoElement): void => {
    if (candidate === youtubeVideo) return;
    youtubeVideo = candidate;
    youtubeReady = true;
    candidate.playsInline = true;
    log("info", "YouTubeのvideo要素を検出しました。", `readyState=${candidate.readyState}`);
    renderStatus();
  };

  const refreshYouTubeVideo = (): void => {
    const candidate = locateYouTubeVideo();
    if (candidate) attachYouTubeVideo(candidate);
    else if (youtubeReady) {
      youtubeVideo = null;
      youtubeReady = false;
      log("warn", "YouTubeのvideo要素が置き換えられました。再検出します。");
      renderStatus();
    }
  };

  const requireYouTubeVideo = (): HTMLVideoElement | null => {
    refreshYouTubeVideo();
    if (!youtubeVideo) {
      showToast("YouTube動画が見つかりません");
      log("error", "YouTube動画を操作できません。", "動画ページを開き、ページの読み込み完了後に実行してください。");
      return null;
    }
    return youtubeVideo;
  };

  const seekBy = (seconds: number): void => {
    const video = requireYouTubeVideo();
    if (!video) return;
    const duration = Number.isFinite(video.duration) ? video.duration : Number.POSITIVE_INFINITY;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    showToast(seconds < 0 ? `${Math.abs(seconds)}秒戻る` : `${seconds}秒進む`);
  };

  const togglePlayback = async (): Promise<void> => {
    const video = requireYouTubeVideo();
    if (!video) return;
    try {
      if (video.paused) await video.play();
      else video.pause();
    } catch (error) {
      log("error", "再生操作に失敗しました。", error);
      showToast("再生できません");
    }
  };

  const updatePlaybackUi = (): void => {
    const video = youtubeVideo;
    if (!video) {
      playButton.textContent = "再生";
      clock.textContent = "--:-- / --:--";
      seek.disabled = true;
      return;
    }
    playButton.textContent = video.paused ? "再生" : "停止";
    const duration = video.duration;
    const seekable = Number.isFinite(duration) && duration > 0;
    seek.disabled = !seekable;
    if (seekable && !seek.matches(":active")) seek.value = String(Math.round((video.currentTime / duration) * 1000));
    clock.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
  };

  const listCameras = async (): Promise<void> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      cameraDevices = devices.filter((device) => device.kind === "videoinput");
      cameraSelect.replaceChildren();
      if (cameraDevices.length === 0) {
        cameraSelect.append(new Option("カメラなし", ""));
        return;
      }
      cameraDevices.forEach((device, index) => {
        cameraSelect.append(new Option(device.label || `カメラ ${index + 1}`, device.deviceId));
      });
      if (selectedDeviceId && cameraDevices.some((device) => device.deviceId === selectedDeviceId)) {
        cameraSelect.value = selectedDeviceId;
      } else {
        const activeId = cameraStream?.getVideoTracks()[0]?.getSettings().deviceId;
        if (activeId) {
          selectedDeviceId = activeId;
          cameraSelect.value = activeId;
        }
      }
      log("info", `${cameraDevices.length}台のカメラを検出しました。`);
    } catch (error) {
      log("warn", "カメラ一覧を取得できませんでした。", error);
    }
  };

  const stopCamera = (): void => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    camera.srcObject = null;
    cameraReady = false;
    renderStatus();
  };

  const startCamera = async (deviceId?: string): Promise<void> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      log("error", "このSafariではカメラAPIを使用できません。", "HTTPSの通常のSafariページで実行してください。");
      showToast("カメラAPI非対応");
      return;
    }
    if (recording || countdownRunning) {
      showToast("録画中はカメラを変更できません");
      return;
    }
    stopCamera();
    const requestedDevice = deviceId || selectedDeviceId;
    const videoConstraints: MediaTrackConstraints = requestedDevice
      ? { deviceId: { exact: requestedDevice }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } }
      : { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } };
    try {
      log("info", "カメラ権限を要求しています。");
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
      camera.srcObject = cameraStream;
      await camera.play();
      const track = cameraStream.getVideoTracks()[0];
      selectedDeviceId = track.getSettings().deviceId ?? requestedDevice ?? "";
      if (selectedDeviceId) storageSet(CAMERA_STORAGE_KEY, selectedDeviceId);
      cameraReady = true;
      centerCard.classList.add("hidden");
      await listCameras();
      renderStatus();
      log("info", "カメラを開始しました。", track.label || "camera");
      showToast("カメラ開始");
      track.addEventListener("ended", () => {
        cameraReady = false;
        renderStatus();
        log("warn", "カメラが停止しました。");
      }, { once: true });
    } catch (error) {
      cameraReady = false;
      centerCard.classList.remove("hidden");
      renderStatus();
      log("error", "カメラを開始できませんでした。", error);
      showToast("カメラ開始失敗");
    }
  };

  const switchCamera = async (): Promise<void> => {
    if (cameraDevices.length < 2) await listCameras();
    if (cameraDevices.length < 2) {
      showToast("切替可能なカメラがありません");
      return;
    }
    const currentIndex = Math.max(0, cameraDevices.findIndex((device) => device.deviceId === selectedDeviceId));
    const next = cameraDevices[(currentIndex + 1) % cameraDevices.length];
    if (!next) return;
    await startCamera(next.deviceId);
  };

  const getAudioBridge = async (video: HTMLVideoElement): Promise<AudioBridge> => {
    const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextConstructor) throw new Error("Web Audio APIを使用できません。");
    const bridges = window.__PINSTAR_AUDIO_BRIDGES__ ??= new WeakMap<HTMLMediaElement, AudioBridge>();
    const existing = bridges.get(video);
    if (existing) {
      if (existing.context.state === "suspended") await existing.context.resume();
      return existing;
    }

    const context = new AudioContextConstructor();
    const source = context.createMediaElementSource(video);
    const destination = context.createMediaStreamDestination();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    source.connect(destination);
    source.connect(analyser);
    analyser.connect(context.destination);
    const bridge: AudioBridge = { context, source, destination, analyser };
    bridges.set(video, bridge);
    if (context.state === "suspended") await context.resume();
    log("info", "YouTube音声をWeb Audioへ接続しました。");
    return bridge;
  };

  const configureCanvas = (): void => {
    const landscape = host.clientWidth >= host.clientHeight;
    recordCanvas.width = landscape ? 1280 : 720;
    recordCanvas.height = landscape ? 720 : 1280;
  };

  const drawCameraFrame = (): void => {
    if (!recording || destroyed) return;
    const context = recordCanvas.getContext("2d", { alpha: false });
    if (!context || camera.videoWidth <= 0 || camera.videoHeight <= 0) {
      drawFrame = window.requestAnimationFrame(drawCameraFrame);
      return;
    }
    const canvasWidth = recordCanvas.width;
    const canvasHeight = recordCanvas.height;
    const sourceRatio = camera.videoWidth / camera.videoHeight;
    const targetRatio = canvasWidth / canvasHeight;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = camera.videoWidth;
    let sourceHeight = camera.videoHeight;
    if (sourceRatio > targetRatio) {
      sourceWidth = camera.videoHeight * targetRatio;
      sourceX = (camera.videoWidth - sourceWidth) / 2;
    } else {
      sourceHeight = camera.videoWidth / targetRatio;
      sourceY = (camera.videoHeight - sourceHeight) / 2;
    }
    context.drawImage(camera, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvasWidth, canvasHeight);
    drawFrame = window.requestAnimationFrame(drawCameraFrame);
  };

  const updateRecordingUi = (): void => {
    const elapsed = recording ? (performance.now() - recordingStartedAt) / 1000 : 0;
    recClock.textContent = `REC ${formatTime(elapsed)}`;
  };

  const finishRecording = (): void => {
    window.cancelAnimationFrame(drawFrame);
    drawFrame = 0;
    recordingStream?.getVideoTracks().forEach((track) => track.stop());
    recordingStream = null;
    recording = false;
    mediaRecorder = null;
    recordButton.classList.remove("recording");
    recordButton.disabled = false;
    stopButton.disabled = true;
    countdownSelect.disabled = false;
    cameraSelect.disabled = false;
    byId<HTMLButtonElement>("switch-camera").disabled = false;
    recClock.textContent = "REC 00:00";
    renderStatus();

    if (recordedChunks.length === 0) {
      log("error", "録画データが生成されませんでした。");
      showToast("録画データなし");
      return;
    }
    const blob = new Blob(recordedChunks, { type: RECORDING_MIME });
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
    lastFile = new File([blob], `Pinstar-${stamp}.mp4`, { type: RECORDING_MIME });
    shareButton.disabled = false;
    log("info", "MP4のエンコードが完了しました。", `${(blob.size / 1024 / 1024).toFixed(1)} MB`);
    showToast("録画を共有できます", 1800);
  };

  const beginRecordingNow = async (): Promise<void> => {
    const video = requireYouTubeVideo();
    if (!video || !cameraStream || !cameraReady) throw new Error("カメラとYouTube動画の準備が必要です。");
    if (!window.MediaRecorder) throw new Error("MediaRecorder APIを使用できません。");
    if (!HTMLCanvasElement.prototype.captureStream) throw new Error("Canvas Capture APIを使用できません。");
    if (MediaRecorder.isTypeSupported && !MediaRecorder.isTypeSupported(RECORDING_MIME)) {
      throw new Error("このSafariはMP4録画に対応していません。");
    }

    if (!activeAudioBridge || activeAudioVideo !== video) {
      throw new Error("YouTube音声の録画経路が準備されていません。録画を押し直してください。");
    }
    configureCanvas();
    const canvasStream = recordCanvas.captureStream(30);
    const videoTrack = canvasStream.getVideoTracks()[0];
    const audioTrack = activeAudioBridge.destination.stream.getAudioTracks()[0];
    if (!videoTrack) throw new Error("カメラ映像の録画トラックを作成できません。");
    if (!audioTrack) throw new Error("YouTube音声の録画トラックを作成できません。");

    recordingStream = new MediaStream([videoTrack, audioTrack]);
    recordedChunks = [];
    lastFile = null;
    shareButton.disabled = true;
    mediaRecorder = new MediaRecorder(recordingStream, { mimeType: RECORDING_MIME });
    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    });
    mediaRecorder.addEventListener("error", (event) => {
      const recorderError = "error" in event ? (event as Event & { error?: DOMException }).error : undefined;
      log("error", "録画処理でエラーが発生しました。", recorderError ?? event.type);
    });
    mediaRecorder.addEventListener("stop", finishRecording, { once: true });

    recording = true;
    recordingStartedAt = performance.now();
    recordButton.classList.add("recording");
    recordButton.disabled = true;
    stopButton.disabled = false;
    countdownSelect.disabled = true;
    cameraSelect.disabled = true;
    byId<HTMLButtonElement>("switch-camera").disabled = true;
    renderStatus();
    drawCameraFrame();
    mediaRecorder.start(1000);
    log("info", "MP4録画を開始しました。", `${recordCanvas.width}×${recordCanvas.height}`);
    showToast("録画開始");
  };

  const startRecordingWithCountdown = async (): Promise<void> => {
    if (recording || countdownRunning) return;
    const video = requireYouTubeVideo();
    if (!video || !cameraReady) {
      showToast("カメラとYouTubeを準備してください");
      return;
    }
    try {
      activeAudioBridge = await getAudioBridge(video);
      activeAudioVideo = video;
    } catch (error) {
      log("error", "YouTube音声を録画用に準備できませんでした。", error);
      showToast("音声準備失敗", 1800);
      return;
    }
    const seconds = Number(countdownSelect.value);
    storageSet(COUNTDOWN_STORAGE_KEY, String(seconds));
    countdownRunning = true;
    recordButton.disabled = true;
    stopButton.disabled = false;
    countdownSelect.disabled = true;
    renderStatus();
    const token = ++countdownToken;
    countdownOverlay.classList.remove("hidden");
    try {
      for (let remaining = seconds; remaining > 0; remaining -= 1) {
        if (token !== countdownToken) return;
        countdownNumber.textContent = String(remaining);
        await new Promise<void>((resolve) => window.setTimeout(resolve, 1000));
      }
      if (token !== countdownToken) return;
      countdownNumber.textContent = "REC";
      await beginRecordingNow();
    } catch (error) {
      log("error", "録画を開始できませんでした。", error);
      showToast("録画開始失敗", 1800);
      recordButton.disabled = false;
      stopButton.disabled = true;
      countdownSelect.disabled = false;
    } finally {
      if (token === countdownToken) {
        countdownRunning = false;
        countdownOverlay.classList.add("hidden");
        renderStatus();
      }
    }
  };

  const stopRecording = (): void => {
    if (countdownRunning) {
      countdownToken += 1;
      countdownRunning = false;
      countdownOverlay.classList.add("hidden");
      recordButton.disabled = false;
      stopButton.disabled = true;
      countdownSelect.disabled = false;
      renderStatus();
      showToast("録画をキャンセルしました");
      return;
    }
    if (!recording || !mediaRecorder) return;
    stopButton.disabled = true;
    mediaRecorder.stop();
    log("info", "録画を停止し、MP4を生成しています。");
    showToast("エンコード中…", 1800);
  };

  const shareRecording = async (): Promise<void> => {
    if (!lastFile) {
      showToast("共有する録画がありません");
      return;
    }
    if (!navigator.share || !navigator.canShare?.({ files: [lastFile] })) {
      log("error", "このSafariではMP4ファイルを共有できません。");
      showToast("ファイル共有非対応");
      return;
    }
    try {
      await navigator.share({ files: [lastFile], title: "Pinstar録画" });
      log("info", "共有シートへ録画ファイルを渡しました。", lastFile.name);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      log("error", "録画ファイルを共有できませんでした。", error);
      showToast("共有失敗");
    }
  };

  const setupDoubleTap = (element: HTMLElement, seconds: number): void => {
    let lastTap = 0;
    bind(element, "pointerup", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const now = performance.now();
      if (now - lastTap <= 340) {
        lastTap = 0;
        seekBy(seconds);
      } else {
        lastTap = now;
      }
    });
  };

  bind(byId("start-camera"), "click", () => void startCamera(selectedDeviceId || undefined));
  bind(byId("switch-camera"), "click", () => void switchCamera());
  bind(cameraSelect, "change", () => {
    if (cameraSelect.value) void startCamera(cameraSelect.value);
  });
  bind(countdownSelect, "change", () => storageSet(COUNTDOWN_STORAGE_KEY, countdownSelect.value));
  bind(byId("back"), "click", () => seekBy(-5));
  bind(byId("forward"), "click", () => seekBy(5));
  bind(playButton, "click", () => void togglePlayback());
  bind(seek, "input", () => {
    const video = requireYouTubeVideo();
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = (Number(seek.value) / 1000) * video.duration;
  });
  setupDoubleTap(byId("tap-left"), -5);
  setupDoubleTap(byId("tap-right"), 5);
  bind(recordButton, "click", () => void startRecordingWithCountdown());
  bind(stopButton, "click", stopRecording);
  bind(shareButton, "click", () => void shareRecording());
  bind(byId("logs"), "click", () => logModal.classList.remove("hidden"));
  bind(byId("close-logs"), "click", () => logModal.classList.add("hidden"));
  bind(byId("copy-logs"), "click", () => {
    const text = logs.map((entry) => `[${entry.at}] ${entry.level.toUpperCase()} ${entry.message}${entry.detail ? `\n${entry.detail}` : ""}`).join("\n");
    navigator.clipboard?.writeText(text).then(
      () => showToast("ログをコピーしました"),
      (error) => log("warn", "ログをコピーできませんでした。", error),
    );
  });

  const handleDeviceChange = (): void => { void listCameras(); };
  navigator.mediaDevices?.addEventListener?.("devicechange", handleDeviceChange);
  cleanup.push(() => navigator.mediaDevices?.removeEventListener?.("devicechange", handleDeviceChange));

  const destroy = (): void => {
    if (destroyed) return;
    if (recording || countdownRunning) {
      showToast("録画を停止してから閉じてください");
      return;
    }
    destroyed = true;
    stopCamera();
    window.clearInterval(videoPoll);
    window.clearInterval(updateTimer);
    window.clearInterval(recordingTimer);
    window.clearTimeout(toastTimer);
    window.cancelAnimationFrame(drawFrame);
    cleanup.splice(0).forEach((fn) => fn());
    document.documentElement.style.overflow = originalDocumentOverflow;
    if (document.body) document.body.style.overflow = originalBodyOverflow;
    host.remove();
    if (window.__PINSTAR__?.destroy === destroy) delete window.__PINSTAR__;
    console.info(`[Pinstar] stopped v${VERSION}`);
  };

  bind(closeButton, "click", destroy);
  videoPoll = window.setInterval(refreshYouTubeVideo, 800);
  updateTimer = window.setInterval(updatePlaybackUi, 200);
  recordingTimer = window.setInterval(updateRecordingUi, 200);
  refreshYouTubeVideo();
  updatePlaybackUi();
  updateRecordingUi();
  renderLogs();
  renderStatus();
  log("info", `Pinstar v${VERSION}を開始しました。`, location.href);
  if (!/^(www\.|m\.)?youtube\.com$/i.test(location.hostname)) {
    log("warn", "YouTube以外のページで実行されています。", location.hostname);
  }

  return { version: VERSION, destroy };
};

try {
  window.__PINSTAR__ = start();
} catch (error) {
  console.error("[Pinstar] fatal", error);
  alert(`Pinstarの起動に失敗しました。\n${describeError(error)}`);
}

export {};
