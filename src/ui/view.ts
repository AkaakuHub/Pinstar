import { ROOT_ID } from "../config";
import { styles } from "./styles";

export type View = {
  host: HTMLDivElement;
  shadow: ShadowRoot;
  app: HTMLDivElement;
  camera: HTMLVideoElement;
  statusDot: HTMLSpanElement;
  statusText: HTMLSpanElement;
  cameraSelect: HTMLSelectElement;
  switchCamera: HTMLButtonElement;
  logsButton: HTMLButtonElement;
  closeButton: HTMLButtonElement;
  centerCard: HTMLDivElement;
  startCamera: HTMLButtonElement;
  tapLeft: HTMLDivElement;
  tapRight: HTMLDivElement;
  back: HTMLButtonElement;
  play: HTMLButtonElement;
  forward: HTMLButtonElement;
  seek: HTMLInputElement;
  clock: HTMLSpanElement;
  recordButton: HTMLButtonElement;
  recordTime: HTMLSpanElement;
  countdownSelect: HTMLSelectElement;
  shareButton: HTMLButtonElement;
  countdownOverlay: HTMLDivElement;
  countdownNumber: HTMLDivElement;
  toast: HTMLDivElement;
  logModal: HTMLDivElement;
  logList: HTMLDivElement;
  copyLogs: HTMLButtonElement;
  closeLogs: HTMLButtonElement;
};

const element = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (name === "class") node.className = value;
    else node.setAttribute(name, value);
  }
  if (text !== undefined) node.textContent = text;
  return node;
};

const button = (id: string, text: string, className: string, label?: string): HTMLButtonElement =>
  element("button", { id, class: className, type: "button", "aria-label": label ?? text }, text);

export const createView = (): View => {
  document.getElementById(ROOT_ID)?.remove();

  const host = element("div", { id: ROOT_ID });
  Object.assign(host.style, {
    position: "fixed",
    zIndex: "2147483647",
    margin: "0",
    padding: "0",
    overflow: "hidden",
    pointerEvents: "auto",
  });

  const shadow = host.attachShadow({ mode: "open" });
  const style = element("style");
  style.textContent = styles;
  shadow.append(style);

  const app = element("div", { id: "app" });
  const camera = element("video", { id: "camera", autoplay: "", muted: "", playsinline: "" });
  camera.muted = true;
  app.append(camera, element("div", { id: "shade" }));

  const tapLayer = element("div", { id: "tap-layer", "aria-label": "左右をダブルタップして5秒移動" });
  const tapLeft = element("div", { id: "tap-left", class: "tap-zone" });
  const tapRight = element("div", { id: "tap-right", class: "tap-zone" });
  tapLayer.append(tapLeft, tapRight);
  app.append(tapLayer);

  const topbar = element("div", { id: "topbar" });
  const brand = element("div", { id: "brand", class: "glass" });
  const statusDot = element("span", { id: "status-dot" });
  const statusText = element("span", { id: "status-text" }, "初期化中");
  brand.append(statusDot, element("span", {}, "Pinstar"), statusText);

  const cameraSelect = element("select", { id: "camera-select", class: "glass", "aria-label": "カメラ入力" });
  cameraSelect.append(new Option("カメラ", ""));
  const switchCamera = button("switch-camera", "↻", "icon-button glass", "カメラ切替");
  const logsButton = button("logs", "≡", "icon-button glass", "動作ログ");
  const closeButton = button("close", "×", "icon-button glass", "閉じる");
  topbar.append(brand, cameraSelect, switchCamera, logsButton, closeButton);
  app.append(topbar);

  const centerCard = element("div", { id: "center-card", class: "glass" });
  centerCard.append(
    element("h1", {}, "カメラを開始"),
    element("p", {}, "映像はカメラ、音声はYouTubeのvideo要素から直接取得します。マイクは使用しません。"),
  );
  const startCamera = button("start-camera", "カメラを許可して開始", "");
  centerCard.append(startCamera);
  app.append(centerCard);

  const playback = element("div", { id: "playback-controls", class: "glass" });
  const back = button("back", "−5", "control-button glass");
  const play = button("play", "再生", "control-button");
  const forward = button("forward", "+5", "control-button glass");
  const seek = element("input", {
    id: "seek",
    type: "range",
    min: "0",
    max: "1000",
    value: "0",
    step: "1",
    "aria-label": "再生位置",
  });
  const clock = element("span", { id: "clock" }, "--:-- / --:--");
  playback.append(back, play, forward, seek, clock);
  app.append(playback);

  const recordDock = element("div", { id: "record-dock" });
  const recordTime = element("span", { id: "record-time" }, "00:00");
  const recordButton = button("record", "", "", "録画開始");
  const countdownSelect = element("select", {
    id: "countdown-select",
    class: "glass",
    "aria-label": "録画開始カウントダウン",
  });
  countdownSelect.append(new Option("3秒", "3"), new Option("5秒", "5"), new Option("10秒", "10"));
  const shareButton = button("share", "共有", "glass");
  shareButton.disabled = true;
  recordDock.append(recordTime, recordButton, countdownSelect, shareButton);
  app.append(recordDock);

  const countdownOverlay = element("div", { id: "countdown-overlay", class: "hidden" });
  const countdownNumber = element("div", { id: "countdown-number" }, "3");
  countdownOverlay.append(countdownNumber);
  app.append(countdownOverlay);

  const toast = element("div", { id: "toast" });
  app.append(toast);

  const logModal = element("div", { id: "log-modal", class: "hidden" });
  const logPanel = element("div", { id: "log-panel", class: "glass" });
  const logHead = element("div", { id: "log-head" });
  const copyLogs = button("copy-logs", "コピー", "control-button glass");
  const closeLogs = button("close-logs", "閉じる", "control-button glass");
  logHead.append(element("strong", {}, "動作ログ"), copyLogs, closeLogs);
  const logList = element("div", { id: "log-list" });
  logPanel.append(logHead, logList);
  logModal.append(logPanel);
  app.append(logModal);

  shadow.append(app);
  document.documentElement.append(host);

  return {
    host,
    shadow,
    app,
    camera,
    statusDot,
    statusText,
    cameraSelect,
    switchCamera,
    logsButton,
    closeButton,
    centerCard,
    startCamera,
    tapLeft,
    tapRight,
    back,
    play,
    forward,
    seek,
    clock,
    recordButton,
    recordTime,
    countdownSelect,
    shareButton,
    countdownOverlay,
    countdownNumber,
    toast,
    logModal,
    logList,
    copyLogs,
    closeLogs,
  };
};
