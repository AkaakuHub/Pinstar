const VERSION = "0.1.0";
const ROOT_ID = "pinstar-root";

type LogLevel = "info" | "warn" | "error";
type LogEntry = { at: string; level: LogLevel; message: string; detail?: string };
type RuntimeHandle = { version: string; destroy: () => void };

declare global {
  interface Window {
    __PINSTAR__?: RuntimeHandle;
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

const css = String.raw`
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; }
  button, select, input { font: inherit; }
  #app {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    width: 100vw;
    height: 100dvh;
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
    background: radial-gradient(circle at center, #1e293b, #020617 68%);
  }
  #shade {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(2,6,23,.66) 0, transparent 24%, transparent 68%, rgba(2,6,23,.8) 100%);
  }
  #tap-layer {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    touch-action: manipulation;
  }
  .tap-zone { border: 0; background: transparent; color: transparent; }
  #topbar {
    position: absolute;
    z-index: 4;
    top: max(8px, env(safe-area-inset-top));
    left: max(10px, env(safe-area-inset-left));
    right: max(10px, env(safe-area-inset-right));
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 40px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 10px;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 999px;
    background: rgba(2,6,23,.68);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .04em;
    white-space: nowrap;
  }
  #status-dot { width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.17); }
  #status-dot.ok { background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,.17); }
  #status-dot.error { background: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.17); }
  #status-text { max-width: 26vw; overflow: hidden; text-overflow: ellipsis; }
  #camera-select {
    min-width: 0;
    max-width: 31vw;
    height: 36px;
    padding: 0 30px 0 11px;
    color: #f8fafc;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 12px;
    background: rgba(2,6,23,.68);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .spacer { flex: 1; }
  .icon-button, .action-button {
    border: 1px solid rgba(255,255,255,.17);
    color: #f8fafc;
    background: rgba(2,6,23,.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 8px 30px rgba(0,0,0,.2);
  }
  .icon-button {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    font-size: 18px;
  }
  .icon-button:active, .action-button:active { transform: scale(.96); }
  #center-card {
    position: absolute;
    z-index: 5;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(340px, calc(100vw - 40px));
    padding: 18px;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 20px;
    background: rgba(2,6,23,.86);
    box-shadow: 0 24px 80px rgba(0,0,0,.45);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    text-align: center;
  }
  #center-card.hidden { display: none; }
  #center-card h1 { margin: 0 0 7px; font-size: 20px; }
  #center-card p { margin: 0 0 14px; color: #cbd5e1; font-size: 12px; line-height: 1.55; }
  .primary {
    width: 100%;
    min-height: 45px;
    border: 0;
    border-radius: 14px;
    color: white;
    background: #2563eb;
    font-weight: 750;
    font-size: 14px;
  }
  #controls {
    position: absolute;
    z-index: 4;
    left: max(10px, env(safe-area-inset-left));
    right: max(10px, env(safe-area-inset-right));
    bottom: max(9px, env(safe-area-inset-bottom));
    display: grid;
    grid-template-columns: auto auto auto minmax(80px, 1fr) auto auto;
    gap: 7px;
    align-items: center;
    padding: 8px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 16px;
    background: rgba(2,6,23,.73);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
  .action-button {
    height: 38px;
    min-width: 42px;
    padding: 0 10px;
    border-radius: 11px;
    font-size: 13px;
    font-weight: 700;
  }
  #play { min-width: 52px; background: rgba(37,99,235,.94); }
  #seek { width: 100%; accent-color: #3b82f6; }
  #clock { min-width: 90px; color: #dbeafe; font-variant-numeric: tabular-nums; font-size: 11px; text-align: center; }
  #hint {
    position: absolute;
    z-index: 3;
    left: 50%;
    bottom: 72px;
    transform: translateX(-50%);
    max-width: 80vw;
    padding: 7px 10px;
    border-radius: 999px;
    color: #e2e8f0;
    background: rgba(2,6,23,.64);
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }
  #toast {
    position: absolute;
    z-index: 8;
    left: 50%;
    top: 18%;
    transform: translate(-50%, -8px);
    opacity: 0;
    padding: 10px 14px;
    border-radius: 12px;
    color: white;
    background: rgba(15,23,42,.9);
    font-size: 13px;
    font-weight: 700;
    transition: .18s ease;
    pointer-events: none;
  }
  #toast.show { opacity: 1; transform: translate(-50%, 0); }
  .modal {
    position: absolute;
    z-index: 10;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgba(2,6,23,.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .modal.hidden { display: none; }
  .panel {
    width: min(520px, 94vw);
    max-height: min(78dvh, 430px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 18px;
    background: #0f172a;
    box-shadow: 0 30px 90px rgba(0,0,0,.5);
  }
  .panel-head { display: flex; align-items: center; gap: 8px; padding: 12px; border-bottom: 1px solid rgba(255,255,255,.1); }
  .panel-head strong { flex: 1; font-size: 14px; }
  #log-list { max-height: 300px; overflow: auto; padding: 10px 12px 16px; -webkit-overflow-scrolling: touch; }
  .log-row { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.08); font-size: 11px; line-height: 1.45; }
  .log-row.error { color: #fecaca; }
  .log-row.warn { color: #fde68a; }
  .log-time { color: #94a3b8; margin-right: 7px; }
  .steps { padding: 15px 18px 18px; color: #e2e8f0; font-size: 13px; line-height: 1.75; }
  .steps ol { margin: 0; padding-left: 20px; }
  .steps b { color: #fff; }
  @media (orientation: portrait) {
    #controls { grid-template-columns: auto auto auto 1fr auto; }
    #logs { display: none; }
    #camera-select { max-width: 38vw; }
    #status-text { display: none; }
  }
  @media (max-height: 390px) and (orientation: landscape) {
    #topbar { top: max(5px, env(safe-area-inset-top)); }
    #controls { bottom: max(5px, env(safe-area-inset-bottom)); padding: 6px; }
    #hint { bottom: 61px; }
    .icon-button { width: 34px; height: 34px; }
    .action-button { height: 34px; }
    #camera-select { height: 34px; }
    .brand { padding: 6px 9px; }
  }
`;

const markup = `
  <div id="app">
    <video id="camera" autoplay muted playsinline></video>
    <div id="shade"></div>
    <div id="tap-layer" aria-label="ダブルタップでシーク">
      <button class="tap-zone" id="tap-left" aria-label="ダブルタップで5秒戻る">戻る</button>
      <button class="tap-zone" id="tap-right" aria-label="ダブルタップで5秒進む">進む</button>
    </div>

    <div id="topbar">
      <div class="brand"><span id="status-dot"></span><span>Pinstar</span><span id="status-text">初期化中</span></div>
      <select id="camera-select" aria-label="カメラ入力"><option value="">カメラ</option></select>
      <button class="icon-button" id="switch-camera" aria-label="カメラ切替">↻</button>
      <span class="spacer"></span>
      <button class="icon-button" id="help" aria-label="録画手順">?</button>
      <button class="icon-button" id="close" aria-label="閉じる">×</button>
    </div>

    <div id="center-card">
      <h1>カメラを開始</h1>
      <p>映像はカメラだけを表示します。マイクは要求しません。YouTubeの音声は、このページでそのまま再生します。</p>
      <button class="primary" id="start-camera">カメラを許可して開始</button>
    </div>

    <div id="hint">画面収録はマイクをオフにしてください</div>
    <div id="toast"></div>

    <div id="controls">
      <button class="action-button" id="back">−5</button>
      <button class="action-button" id="play">再生</button>
      <button class="action-button" id="forward">+5</button>
      <input id="seek" type="range" min="0" max="1000" value="0" step="1" aria-label="再生位置">
      <span id="clock">--:-- / --:--</span>
      <button class="action-button" id="logs">ログ</button>
    </div>

    <div class="modal hidden" id="log-modal">
      <div class="panel">
        <div class="panel-head"><strong>動作ログ</strong><button class="action-button" id="copy-logs">コピー</button><button class="action-button" id="close-logs">閉じる</button></div>
        <div id="log-list"></div>
      </div>
    </div>

    <div class="modal hidden" id="help-modal">
      <div class="panel">
        <div class="panel-head"><strong>iPhoneでの録画手順</strong><button class="action-button" id="close-help">閉じる</button></div>
        <div class="steps"><ol>
          <li>YouTubeを再生できる状態にします。</li>
          <li>コントロールセンターを開き、画面収録を長押しします。</li>
          <li><b>マイクをオフ</b>にして画面収録を開始します。</li>
          <li>横画面に戻り、再生・シークを操作します。</li>
        </ol></div>
      </div>
    </div>
  </div>
`;

const start = (): RuntimeHandle => {
  window.__PINSTAR__?.destroy();
  document.getElementById(ROOT_ID)?.remove();

  const host = document.createElement("div");
  host.id = ROOT_ID;
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
  const cameraSelect = byId<HTMLSelectElement>("camera-select");
  const centerCard = byId<HTMLDivElement>("center-card");
  const seek = byId<HTMLInputElement>("seek");
  const playButton = byId<HTMLButtonElement>("play");
  const clock = byId<HTMLSpanElement>("clock");
  const statusDot = byId<HTMLSpanElement>("status-dot");
  const statusText = byId<HTMLSpanElement>("status-text");
  const toast = byId<HTMLDivElement>("toast");
  const logModal = byId<HTMLDivElement>("log-modal");
  const helpModal = byId<HTMLDivElement>("help-modal");
  const logList = byId<HTMLDivElement>("log-list");
  const logs: LogEntry[] = [];
  const cleanup: Array<() => void> = [];

  let cameraStream: MediaStream | null = null;
  let youtubeVideo: HTMLVideoElement | null = null;
  let cameraDevices: MediaDeviceInfo[] = [];
  let selectedDeviceId = "";
  let toastTimer = 0;
  let videoPoll = 0;
  let updateTimer = 0;
  let destroyed = false;
  let cameraReady = false;
  let youtubeReady = false;

  const renderStatus = (): void => {
    statusDot.className = "";
    if (logs.some((entry) => entry.level === "error")) statusDot.classList.add("error");
    else if (cameraReady && youtubeReady) statusDot.classList.add("ok");

    if (!youtubeReady) statusText.textContent = "YouTube待機";
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
    if (logs.length > 80) logs.shift();
    renderLogs();
    renderStatus();
    console[level === "error" ? "error" : level === "warn" ? "warn" : "info"](`[Pinstar] ${message}`, detail ?? "");
  };

  const showToast = (message: string): void => {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1200);
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
    stopCamera();
    const videoConstraints: MediaTrackConstraints = deviceId
      ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } }
      : { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } };
    try {
      log("info", "カメラ権限を要求しています。");
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
      camera.srcObject = cameraStream;
      await camera.play();
      const track = cameraStream.getVideoTracks()[0];
      selectedDeviceId = track.getSettings().deviceId ?? deviceId ?? "";
      cameraReady = true;
      centerCard.classList.add("hidden");
      renderStatus();
      await listCameras();
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
    selectedDeviceId = next.deviceId;
    cameraSelect.value = next.deviceId;
    await startCamera(next.deviceId);
  };

  const setupDoubleTap = (element: HTMLElement, seconds: number): void => {
    let lastTap = 0;
    bind(element, "pointerup", (event) => {
      event.preventDefault();
      const now = performance.now();
      if (now - lastTap < 360) {
        lastTap = 0;
        seekBy(seconds);
      } else {
        lastTap = now;
      }
    });
  };

  bind(byId("start-camera"), "click", () => void startCamera());
  bind(byId("switch-camera"), "click", () => void switchCamera());
  bind(cameraSelect, "change", () => {
    if (cameraSelect.value) void startCamera(cameraSelect.value);
  });
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
  bind(byId("logs"), "click", () => logModal.classList.remove("hidden"));
  bind(byId("close-logs"), "click", () => logModal.classList.add("hidden"));
  bind(byId("help"), "click", () => helpModal.classList.remove("hidden"));
  bind(byId("close-help"), "click", () => helpModal.classList.add("hidden"));
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
    destroyed = true;
    stopCamera();
    window.clearInterval(videoPoll);
    window.clearInterval(updateTimer);
    window.clearTimeout(toastTimer);
    cleanup.splice(0).forEach((fn) => fn());
    host.remove();
    if (window.__PINSTAR__?.destroy === destroy) delete window.__PINSTAR__;
    console.info(`[Pinstar] stopped v${VERSION}`);
  };

  bind(byId("close"), "click", destroy);
  videoPoll = window.setInterval(refreshYouTubeVideo, 800);
  updateTimer = window.setInterval(updatePlaybackUi, 200);
  refreshYouTubeVideo();
  updatePlaybackUi();
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
